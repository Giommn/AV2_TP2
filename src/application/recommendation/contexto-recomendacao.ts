import type { Projeto } from '../../domain/entities/projeto.js';
import type { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import type { Profissional } from '../../domain/entities/profissional.js';

export class ContextoRecomendacao {
  constructor(
    readonly projeto: Projeto,
    readonly papel: PapelRequerido,
    readonly membrosEscalados: readonly Profissional[],
    readonly orcamentoDisponivel: number,
  ) {}

  idsEscalados(): readonly string[] {
    return this.membrosEscalados.map((membro) => membro.id);
  }

  afinidadeMediaComEquipe(profissionalId: string): number {
    if (this.membrosEscalados.length === 0) {
      return 0;
    }
    const soma = this.membrosEscalados.reduce(
      (total, membro) => total + membro.afinidadeCom(profissionalId),
      0,
    );
    return soma / this.membrosEscalados.length;
  }
}
