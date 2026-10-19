import type { Papel } from '../enums/papel.js';
import type { NomeEstrategia } from '../enums/nome-estrategia.js';
import type { EventoDominio } from '../ports/barramento-eventos.js';

export const TIPOS_EVENTO = {
  RECOMENDACAO_GERADA: 'RecomendacaoGerada',
  EQUIPE_COMPOSTA: 'EquipeComposta',
  CONVITE_CRIADO: 'ConviteCriado',
  CONVITE_ACEITO: 'ConviteAceito',
  CONVITE_RECUSADO: 'ConviteRecusado',
  EQUIPE_FORMADA: 'EquipeFormada',
} as const;

export class RecomendacaoGeradaEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.RECOMENDACAO_GERADA;

  constructor(
    readonly projetoId: string,
    readonly papel: Papel,
    readonly estrategia: NomeEstrategia,
    readonly candidatosConsiderados: number,
    readonly profissionalEscolhidoId: string,
    readonly origemDados: 'REPOSITORIO' | 'FALLBACK',
    readonly ocorridoEm: Date = new Date(),
  ) {}
}

export class EquipeCompostaEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.EQUIPE_COMPOSTA;

  constructor(
    readonly equipeId: string,
    readonly projetoId: string,
    readonly totalMembros: number,
    readonly custoTotal: number,
    readonly ocorridoEm: Date = new Date(),
  ) {}
}

export class ConviteCriadoEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.CONVITE_CRIADO;

  constructor(
    readonly conviteId: string,
    readonly equipeId: string,
    readonly profissionalId: string,
    readonly papel: Papel,
    readonly cacheOferecido: number,
    readonly ocorridoEm: Date = new Date(),
  ) {}
}

export class ConviteAceitoEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.CONVITE_ACEITO;

  constructor(
    readonly conviteId: string,
    readonly equipeId: string,
    readonly profissionalId: string,
    readonly ocorridoEm: Date = new Date(),
  ) {}
}

export class ConviteRecusadoEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.CONVITE_RECUSADO;

  constructor(
    readonly conviteId: string,
    readonly equipeId: string,
    readonly profissionalId: string,
    readonly ocorridoEm: Date = new Date(),
  ) {}
}

export class EquipeFormadaEvento implements EventoDominio {
  readonly tipo = TIPOS_EVENTO.EQUIPE_FORMADA;

  constructor(
    readonly equipeId: string,
    readonly projetoId: string,
    readonly ocorridoEm: Date = new Date(),
  ) {}
}
