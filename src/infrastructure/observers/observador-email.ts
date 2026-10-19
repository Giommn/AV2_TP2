import { TIPOS_EVENTO, ConviteCriadoEvento } from '../../domain/events/eventos.js';
import type { EventoDominio, ObservadorEvento } from '../../domain/ports/barramento-eventos.js';

export interface EmailSimulado {
  readonly destinatario: string;
  readonly assunto: string;
  readonly corpo: string;
  readonly enviadoEm: Date;
}

export class ObservadorEmail implements ObservadorEvento {
  readonly nome = 'ObservadorEmail';
  private readonly enviados: EmailSimulado[] = [];

  tratar(evento: EventoDominio): void {
    if (evento instanceof ConviteCriadoEvento) {
      this.enviados.push({
        destinatario: evento.profissionalId,
        assunto: `Convite para o papel ${evento.papel}`,
        corpo: `Voce recebeu um convite com cache de ${evento.cacheOferecido}.`,
        enviadoEm: new Date(),
      });
      return;
    }
    if (evento.tipo === TIPOS_EVENTO.EQUIPE_FORMADA) {
      this.enviados.push({
        destinatario: 'producao@cinebridge.example',
        assunto: 'Equipe formada',
        corpo: 'A equipe foi integralmente confirmada.',
        enviadoEm: new Date(),
      });
    }
  }

  listar(): readonly EmailSimulado[] {
    return [...this.enviados];
  }
}
