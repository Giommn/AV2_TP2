import { Projeto, type DadosProjeto } from '../projeto.js';
import { TipoCaptacao } from '../../enums/tipo-captacao.js';

export interface OpcoesProjetoFiccao extends Omit<DadosProjeto, 'complexidadeCenografia'> {
  complexidadeCenografia: number;
}

export class ProjetoFiccao extends Projeto {
  readonly complexidadeCenografia: number;

  constructor(dados: OpcoesProjetoFiccao) {
    super(dados);
    this.complexidadeCenografia = dados.complexidadeCenografia;
  }

  clonar(ajustes?: Partial<DadosProjeto>): ProjetoFiccao {
    const base = this.clonarBase(ajustes);
    return new ProjetoFiccao({
      ...base,
      tipoCaptacao: TipoCaptacao.FICCAO,
      complexidadeCenografia: ajustes?.complexidadeCenografia ?? this.complexidadeCenografia,
    });
  }

  densidadeDramatica(): number {
    return Math.min(1, this.complexidadeCenografia / 5 + this.duracaoEstimadaMinutos / 1000);
  }
}
