import { VetorCompetencias } from '../value-objects/vetor-competencias.js';
import { Localizacao } from '../value-objects/localizacao.js';
import { IntervaloDatas } from '../value-objects/intervalo-datas.js';
import type { Papel } from '../enums/papel.js';

export interface OpcoesProfissional {
  id: string;
  nome: string;
  papeis: readonly Papel[];
  competencias: VetorCompetencias;
  precoMinimo: number;
  precoMaximo: number;
  disponibilidade: readonly IntervaloDatas[];
  localizacao: Localizacao;
  mediaAvaliacoes: number;
  totalAvaliacoes: number;
  afinidades: Record<string, number>;
}

export class Profissional {
  readonly id: string;
  readonly nome: string;
  readonly papeis: readonly Papel[];
  readonly competencias: VetorCompetencias;
  readonly precoMinimo: number;
  readonly precoMaximo: number;
  readonly disponibilidade: readonly IntervaloDatas[];
  readonly localizacao: Localizacao;
  readonly mediaAvaliacoes: number;
  readonly totalAvaliacoes: number;
  readonly afinidades: Readonly<Record<string, number>>;

  constructor(opcoes: OpcoesProfissional) {
    this.id = opcoes.id;
    this.nome = opcoes.nome;
    this.papeis = [...opcoes.papeis];
    this.competencias = opcoes.competencias;
    this.precoMinimo = opcoes.precoMinimo;
    this.precoMaximo = opcoes.precoMaximo;
    this.disponibilidade = [...opcoes.disponibilidade];
    this.localizacao = opcoes.localizacao;
    this.mediaAvaliacoes = opcoes.mediaAvaliacoes;
    this.totalAvaliacoes = opcoes.totalAvaliacoes;
    this.afinidades = { ...opcoes.afinidades };
  }

  atuaComo(papel: Papel): boolean {
    return this.papeis.includes(papel);
  }

  cobraAte(teto: number): boolean {
    return this.precoMinimo <= teto;
  }

  estaDisponivelEm(intervalo: IntervaloDatas): boolean {
    return this.disponibilidade.some((janela) => janela.contemIntervalo(intervalo));
  }

  afinidadeCom(profissionalId: string): number {
    return this.afinidades[profissionalId] ?? 0;
  }

  notaNormalizada(): number {
    return this.mediaAvaliacoes / 5;
  }

  custoMedio(): number {
    return (this.precoMinimo + this.precoMaximo) / 2;
  }
}
