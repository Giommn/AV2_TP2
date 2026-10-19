import type { EventoDominio, ObservadorEvento } from '../../domain/ports/barramento-eventos.js';

export interface MensagemPublicada {
  readonly topico: string;
  readonly tipoEvento: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly publicadoEm: Date;
}

export class ObservadorMensageria implements ObservadorEvento {
  readonly nome = 'ObservadorMensageria';
  private readonly publicadas: MensagemPublicada[] = [];

  tratar(evento: EventoDominio): void {
    this.publicadas.push({
      topico: `cinebridge.${evento.tipo}`,
      tipoEvento: evento.tipo,
      payload: { ...evento },
      publicadoEm: new Date(),
    });
  }

  listar(): readonly MensagemPublicada[] {
    return [...this.publicadas];
  }
}
