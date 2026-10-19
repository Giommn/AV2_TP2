import { Projeto, type DadosProjeto } from '../projeto.js';
import { TipoCaptacao } from '../../enums/tipo-captacao.js';
import { EstiloAnimacao } from '../../enums/estilo-animacao.js';

export interface OpcoesProjetoAnimacao extends Omit<DadosProjeto, 'taxaQuadrosPorSegundo' | 'estiloAnimacao'> {
  taxaQuadrosPorSegundo: number;
  estiloAnimacao: EstiloAnimacao;
}

export class ProjetoAnimacao extends Projeto {
  readonly taxaQuadrosPorSegundo: number;
  readonly estiloAnimacao: EstiloAnimacao;

  constructor(dados: OpcoesProjetoAnimacao) {
    super(dados);
    this.taxaQuadrosPorSegundo = dados.taxaQuadrosPorSegundo;
    this.estiloAnimacao = dados.estiloAnimacao;
  }

  clonar(ajustes?: Partial<DadosProjeto>): ProjetoAnimacao {
    const base = this.clonarBase(ajustes);
    return new ProjetoAnimacao({
      ...base,
      tipoCaptacao: TipoCaptacao.ANIMACAO,
      taxaQuadrosPorSegundo: ajustes?.taxaQuadrosPorSegundo ?? this.taxaQuadrosPorSegundo,
      estiloAnimacao: ajustes?.estiloAnimacao ?? this.estiloAnimacao,
    });
  }

  totalFrames(): number {
    const totalSegundos = this.duracaoEstimadaMinutos * 60;
    return Math.round(totalSegundos * this.taxaQuadrosPorSegundo);
  }
}
