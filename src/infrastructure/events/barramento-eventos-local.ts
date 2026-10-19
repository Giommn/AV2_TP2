import { EventEmitter } from 'node:events';
import type { BarramentoEventos, EventoDominio, ObservadorEvento } from '../../domain/ports/barramento-eventos.js';

const CANAL_GLOBAL = '*';

export class BarramentoEventosLocal implements BarramentoEventos {
  private readonly emissor = new EventEmitter();
  private readonly historico: EventoDominio[] = [];
  private pendentes: Promise<void>[] = [];

  constructor() {
    this.emissor.setMaxListeners(200);
  }

  inscrever(observador: ObservadorEvento): void {
    this.registrar(CANAL_GLOBAL, observador);
  }

  inscreverPorTipo(tipo: string, observador: ObservadorEvento): void {
    this.registrar(tipo, observador);
  }

  async publicar(evento: EventoDominio): Promise<void> {
    this.historico.push(evento);
    this.emissor.emit(CANAL_GLOBAL, evento);
    this.emissor.emit(evento.tipo, evento);
    const novas = this.pendentes.splice(0, this.pendentes.length);
    await Promise.all(novas);
  }

  historicoEventos(): readonly EventoDominio[] {
    return [...this.historico];
  }

  private registrar(canal: string, observador: ObservadorEvento): void {
    this.emissor.on(canal, (evento: EventoDominio) => {
      const execucao = Promise.resolve(observador.tratar(evento)).catch(() => undefined);
      this.pendentes.push(execucao);
    });
  }
}
