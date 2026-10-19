import type { Papel } from '../enums/papel.js';
import type { NomeEstrategia } from '../enums/nome-estrategia.js';

export interface CandidatoRecomendado {
  readonly profissionalId: string;
  readonly nomeProfissional: string;
  readonly pontuacao: number;
  readonly componentes: Readonly<Record<string, number>>;
}

export class Recomendacao {
  readonly id: string;
  readonly projetoId: string;
  readonly papel: Papel;
  readonly estrategiaUsada: NomeEstrategia;
  readonly origemDados: 'REPOSITORIO' | 'FALLBACK';
  readonly candidatos: readonly CandidatoRecomendado[];

  constructor(params: {
    id: string;
    projetoId: string;
    papel: Papel;
    estrategiaUsada: NomeEstrategia;
    origemDados: 'REPOSITORIO' | 'FALLBACK';
    candidatos: readonly CandidatoRecomendado[];
  }) {
    this.id = params.id;
    this.projetoId = params.projetoId;
    this.papel = params.papel;
    this.estrategiaUsada = params.estrategiaUsada;
    this.origemDados = params.origemDados;
    this.candidatos = [...params.candidatos];
  }

  melhorCandidato(): CandidatoRecomendado | undefined {
    return this.candidatos[0];
  }
}
