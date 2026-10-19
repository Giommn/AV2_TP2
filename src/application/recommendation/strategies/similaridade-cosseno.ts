import { NomeEstrategia } from '../../../domain/enums/nome-estrategia.js';
import { CandidatoRanqueado } from '../candidato-ranqueado.js';
import { normalizarCusto } from '../pontuacao.js';
import type { EstrategiaRecomendacao } from './estrategia-recomendacao.js';
import type { ContextoRecomendacao } from '../contexto-recomendacao.js';
import type { ParametrosRecomendacao } from '../parametros-recomendacao.js';
import type { Profissional } from '../../../domain/entities/profissional.js';

export class EstrategiaSimilaridadeCosseno implements EstrategiaRecomendacao {
  readonly nome = NomeEstrategia.SIMILARIDADE_COSSENO;

  ranquear(
    candidatos: readonly Profissional[],
    contexto: ContextoRecomendacao,
    parametros: ParametrosRecomendacao,
  ): CandidatoRanqueado[] {
    const desejado = contexto.papel.competenciasDesejadas;
    return candidatos.map((profissional) => {
      const competencia = desejado.similaridadeCosseno(profissional.competencias);
      const avaliacao = profissional.notaNormalizada();
      const custo = normalizarCusto(profissional.custoMedio(), contexto.orcamentoDisponivel);
      const localizacao = contexto.projeto.localizacaoFiltragens.afinidadeCom(profissional.localizacao);
      const componentes = { competencia, avaliacao, custo, localizacao };
      const pontuacao =
        parametros.pesoCompetencia * competencia +
        parametros.pesoAvaliacao * avaliacao +
        parametros.pesoCusto * custo +
        parametros.pesoLocalizacao * localizacao;
      return new CandidatoRanqueado(profissional, pontuacao, componentes);
    });
  }
}
