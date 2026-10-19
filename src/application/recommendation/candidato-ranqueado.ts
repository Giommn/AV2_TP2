import type { Profissional } from '../../domain/entities/profissional.js';
import type { CandidatoRecomendado } from '../../domain/entities/recomendacao.js';

export class CandidatoRanqueado {
  constructor(
    readonly profissional: Profissional,
    readonly pontuacao: number,
    readonly componentes: Readonly<Record<string, number>>,
  ) {}

  paraRecomendado(): CandidatoRecomendado {
    return {
      profissionalId: this.profissional.id,
      nomeProfissional: this.profissional.nome,
      pontuacao: this.pontuacao,
      componentes: this.componentes,
    };
  }
}
