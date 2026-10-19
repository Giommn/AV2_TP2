import { NomeEstrategia } from '../../../domain/enums/nome-estrategia.js';
import { CandidatoRanqueado } from '../candidato-ranqueado.js';
import { normalizarCusto } from '../pontuacao.js';
import type { EstrategiaRecomendacao } from './estrategia-recomendacao.js';
import type { ContextoRecomendacao } from '../contexto-recomendacao.js';
import type { ParametrosRecomendacao } from '../parametros-recomendacao.js';
import type { Profissional } from '../../../domain/entities/profissional.js';

export class EstrategiaOrcamentoReduzido implements EstrategiaRecomendacao {
  readonly nome = NomeEstrategia.ORCAMENTO_REDUZIDO;

  ranquear(
    candidatos: readonly Profissional[],
    contexto: ContextoRecomendacao,
    _parametros: ParametrosRecomendacao,
  ): CandidatoRanqueado[] {
    const desejado = contexto.papel.competenciasDesejadas;
    return candidatos.map((profissional) => {
      const custo = normalizarCusto(profissional.custoMedio(), contexto.orcamentoDisponivel);
      const competencia = desejado.similaridadeCosseno(profissional.competencias);
      const avaliacao = profissional.notaNormalizada();
      const componentes = { custo, competencia, avaliacao };
      const pontuacao = 0.5 * custo + 0.3 * competencia + 0.2 * avaliacao;
      return new CandidatoRanqueado(profissional, pontuacao, componentes);
    });
  }
}
