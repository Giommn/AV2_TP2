import type { VisitanteProjeto } from '../../domain/visitors/visitante-projeto.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { MembroEquipe } from '../../domain/entities/membro-equipe.js';
import type { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { Recomendacao } from '../../domain/entities/recomendacao.js';
import type { StatusEquipe } from '../../domain/enums/status-equipe.js';
import type { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import type { MetricasCompatibilidade } from './calculador-compatibilidade.js';

export interface RelatorioProdutor {
  readonly projetoId: string;
  readonly tipoCaptacao: TipoCaptacao;
  readonly titulo: string;
  readonly totalMembros: number;
  readonly custoTotalEquipe: number;
  readonly statusEquipe: StatusEquipe;
  readonly totalRecomendacoes: number;
  readonly indiceAderenciaMedia: number;
  readonly sinergiaTecnicaMedia: number;
  readonly resumo: string;
}

export class GeradorRelatorioProdutor implements VisitanteProjeto {
  private totalMembros = 0;

  visitarProjeto(_projeto: Projeto): void {
    this.totalMembros = 0;
  }

  visitarPapelRequerido(_papel: PapelRequerido): void {}

  visitarEquipe(_equipe: Equipe): void {
    this.totalMembros = 0;
  }

  visitarMembroEquipe(_membro: MembroEquipe): void {
    this.totalMembros += 1;
  }

  gerar(
    projeto: Projeto,
    equipe: Equipe,
    recomendacoes: readonly Recomendacao[],
    metricas: MetricasCompatibilidade,
  ): RelatorioProdutor {
    projeto.aceitarVisitante(this);
    const resumo =
      `Projeto ${projeto.titulo ?? projeto.genero} (${projeto.tipoCaptacao}) com ` +
      `${equipe.membros.length} profissionais escalados, custo total de ` +
      `R$ ${equipe.custoTotal().toFixed(2)} e status ${equipe.status}.`;
    return {
      projetoId: projeto.id,
      tipoCaptacao: projeto.tipoCaptacao,
      titulo: projeto.titulo ?? projeto.genero,
      totalMembros: equipe.membros.length,
      custoTotalEquipe: equipe.custoTotal(),
      statusEquipe: equipe.status,
      totalRecomendacoes: recomendacoes.length,
      indiceAderenciaMedia: metricas.indiceAderenciaMedia,
      sinergiaTecnicaMedia: metricas.sinergiaTecnicaMedia,
      resumo,
    };
  }
}
