import type { Projeto } from '../../domain/entities/projeto.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { Recomendacao } from '../../domain/entities/recomendacao.js';
import type { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import type { EventoDominio } from '../../domain/ports/barramento-eventos.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export interface RelatorioEspecializado {
  readonly tipo: TipoCaptacao;
  readonly titulo: string;
  readonly metricas: Readonly<Record<string, number>>;
  readonly observacoes: readonly string[];
}

export abstract class NotificadorProjeto {
  constructor(protected readonly barramento: BarramentoEventos) {}

  abstract gerarRelatorio(
    projeto: Projeto,
    equipe: Equipe,
    recomendacoes: readonly Recomendacao[],
  ): RelatorioEspecializado;

  async notificar(evento: EventoDominio): Promise<void> {
    await this.barramento.publicar(evento);
  }
}

export class NotificadorGenerico extends NotificadorProjeto {
  constructor(barramento: BarramentoEventos, private readonly tipo: TipoCaptacao) {
    super(barramento);
  }

  gerarRelatorio(projeto: Projeto, equipe: Equipe): RelatorioEspecializado {
    return {
      tipo: this.tipo,
      titulo: `Relatorio ${this.tipo}`,
      metricas: {
        totalMembros: equipe.membros.length,
        custoTotalEquipe: equipe.custoTotal(),
        orcamentoProjeto: projeto.orcamentoTotal,
      },
      observacoes: ['Relatorio generico emitido pelo notificador padrao.'],
    };
  }
}
