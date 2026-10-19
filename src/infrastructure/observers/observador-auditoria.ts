import type { EventoDominio, ObservadorEvento } from '../../domain/ports/barramento-eventos.js';

export interface RegistroAuditoria {
  readonly tipo: string;
  readonly ocorridoEm: Date;
  readonly descricao: string;
}

export class ObservadorAuditoria implements ObservadorEvento {
  readonly nome = 'ObservadorAuditoria';
  private readonly registros: RegistroAuditoria[] = [];

  tratar(evento: EventoDominio): void {
    this.registros.push({
      tipo: evento.tipo,
      ocorridoEm: evento.ocorridoEm,
      descricao: `Evento ${evento.tipo} registrado na trilha de auditoria`,
    });
  }

  listar(): readonly RegistroAuditoria[] {
    return [...this.registros];
  }
}
