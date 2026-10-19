import { Projeto, type DadosProjeto } from '../projeto.js';
import { TipoCaptacao } from '../../enums/tipo-captacao.js';

export type OpcoesProjetoDocumentario = DadosProjeto & { margemReservaImprevistos: number };

export class ProjetoDocumentario extends Projeto {
  readonly margemReservaImprevistos: number;

  constructor(dados: OpcoesProjetoDocumentario) {
    super(dados);
    this.margemReservaImprevistos = dados.margemReservaImprevistos;
  }

  clonar(ajustes?: Partial<DadosProjeto>): ProjetoDocumentario {
    const base = this.clonarBase(ajustes);
    return new ProjetoDocumentario({
      ...base,
      tipoCaptacao: TipoCaptacao.DOCUMENTARIO,
      margemReservaImprevistos: ajustes?.margemReservaImprevistos ?? this.margemReservaImprevistos,
    });
  }

  valorReservaImprevistos(): number {
    return this.orcamentoTotal * this.margemReservaImprevistos;
  }
}
