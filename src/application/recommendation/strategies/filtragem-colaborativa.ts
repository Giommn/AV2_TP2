import { NomeEstrategia } from '../../../domain/enums/nome-estrategia.js';
import { CandidatoRanqueado } from '../candidato-ranqueado.js';
import { mediaBayesiana, normalizarCusto } from '../pontuacao.js';
import type { EstrategiaRecomendacao } from './estrategia-recomendacao.js';
import type { ContextoRecomendacao } from '../contexto-recomendacao.js';
import type { ParametrosRecomendacao } from '../parametros-recomendacao.js';
import type { Profissional } from '../../../domain/entities/profissional.js';

export class EstrategiaFiltragemColaborativa implements EstrategiaRecomendacao {
  readonly nome = NomeEstrategia.FILTRAGEM_COLABORATIVA;

  ranquear(
    candidatos: readonly Profissional[],
    contexto: ContextoRecomendacao,
    parametros: ParametrosRecomendacao,
  ): CandidatoRanqueado[] {
    const desejado = contexto.papel.competenciasDesejadas;
    return candidatos.map((profissional) => {
      const colaborativa = mediaBayesiana(
        profissional.mediaAvaliacoes,
        profissional.totalAvaliacoes,
      );
      const afinidade = contexto.afinidadeMediaComEquipe(profissional.id);
      const competencia = desejado.similaridadeCosseno(profissional.competencias);
      const custo = normalizarCusto(profissional.custoMedio(), contexto.orcamentoDisponivel);
      const localizacao = contexto.projeto.localizacaoFiltragens.afinidadeCom(profissional.localizacao);
      const componentes = { colaborativa, afinidade, competencia, custo, localizacao };
      const pontuacao =
        parametros.pesoCompetencia * competencia +
        parametros.pesoAvaliacao * colaborativa +
        parametros.pesoAfinidade * afinidade +
        parametros.pesoCusto * custo +
        parametros.pesoLocalizacao * localizacao;
      return new CandidatoRanqueado(profissional, pontuacao, componentes);
    });
  }
}
