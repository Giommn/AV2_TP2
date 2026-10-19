import type { Papel } from '../enums/papel.js';
import type { VisitanteProjeto } from '../visitors/visitante-projeto.js';

export class MembroEquipe {
  readonly profissionalId: string;
  readonly nomeProfissional: string;
  readonly papel: Papel;
  readonly cacheNegociado: number;
  private _confirmado: boolean;

  constructor(params: {
    profissionalId: string;
    nomeProfissional: string;
    papel: Papel;
    cacheNegociado: number;
    confirmado?: boolean;
  }) {
    this.profissionalId = params.profissionalId;
    this.nomeProfissional = params.nomeProfissional;
    this.papel = params.papel;
    this.cacheNegociado = params.cacheNegociado;
    this._confirmado = params.confirmado ?? false;
  }

  get confirmado(): boolean {
    return this._confirmado;
  }

  confirmar(): void {
    this._confirmado = true;
  }

  aceitarVisitante(visitante: VisitanteProjeto): void {
    visitante.visitarMembroEquipe(this);
  }
}
