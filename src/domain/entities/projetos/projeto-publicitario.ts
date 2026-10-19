import { Projeto, type DadosProjeto } from '../projeto.js';
import { TipoCaptacao } from '../../enums/tipo-captacao.js';

export interface OpcoesProjetoPublicitario extends Omit<DadosProjeto, 'clienteAnunciante' | 'prazoVeiculacaoDias'> {
  clienteAnunciante: string;
  prazoVeiculacaoDias: number;
}

export class ProjetoPublicitario extends Projeto {
  readonly clienteAnunciante: string;
  readonly prazoVeiculacaoDias: number;

  constructor(dados: OpcoesProjetoPublicitario) {
    super(dados);
    this.clienteAnunciante = dados.clienteAnunciante;
    this.prazoVeiculacaoDias = dados.prazoVeiculacaoDias;
  }

  clonar(ajustes?: Partial<DadosProjeto>): ProjetoPublicitario {
    const base = this.clonarBase(ajustes);
    return new ProjetoPublicitario({
      ...base,
      tipoCaptacao: TipoCaptacao.PUBLICITARIO,
      clienteAnunciante: ajustes?.clienteAnunciante ?? this.clienteAnunciante,
      prazoVeiculacaoDias: ajustes?.prazoVeiculacaoDias ?? this.prazoVeiculacaoDias,
    });
  }

  custoDiarioVeiculacao(): number {
    return this.orcamentoTotal / Math.max(1, this.prazoVeiculacaoDias);
  }
}
