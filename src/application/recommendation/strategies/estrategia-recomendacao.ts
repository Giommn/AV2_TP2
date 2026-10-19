import type { Profissional } from '../../../domain/entities/profissional.js';
import type { NomeEstrategia } from '../../../domain/enums/nome-estrategia.js';
import type { ContextoRecomendacao } from '../contexto-recomendacao.js';
import type { ParametrosRecomendacao } from '../parametros-recomendacao.js';
import type { CandidatoRanqueado } from '../candidato-ranqueado.js';

export interface EstrategiaRecomendacao {
  readonly nome: NomeEstrategia;
  ranquear(
    candidatos: readonly Profissional[],
    contexto: ContextoRecomendacao,
    parametros: ParametrosRecomendacao,
  ): CandidatoRanqueado[];
}
