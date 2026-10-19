import { NomeEstrategia } from '../../domain/enums/nome-estrategia.js';
import { criarEstrategia } from './strategies/fabrica-estrategias.js';
import { PARAMETROS_PADRAO, type ParametrosRecomendacao } from './parametros-recomendacao.js';
import type { EstrategiaRecomendacao } from './strategies/estrategia-recomendacao.js';
import type { ContextoRecomendacao } from './contexto-recomendacao.js';
import type { CandidatoRanqueado } from './candidato-ranqueado.js';
import type { Profissional } from '../../domain/entities/profissional.js';
import type { Papel } from '../../domain/enums/papel.js';

export class MotorRecomendacao {
  private estrategia: EstrategiaRecomendacao;
  private parametros: ParametrosRecomendacao;

  constructor(estrategia: EstrategiaRecomendacao, parametros: ParametrosRecomendacao = PARAMETROS_PADRAO) {
    this.estrategia = estrategia;
    this.parametros = parametros;
  }

  static padrao(): MotorRecomendacao {
    return new MotorRecomendacao(criarEstrategia(NomeEstrategia.SIMILARIDADE_COSSENO));
  }

  get nomeEstrategia(): NomeEstrategia {
    return this.estrategia.nome;
  }

  get parametrosAtuais(): ParametrosRecomendacao {
    return this.parametros;
  }

  trocarEstrategia(nome: NomeEstrategia): void {
    this.estrategia = criarEstrategia(nome);
  }

  definirEstrategia(estrategia: EstrategiaRecomendacao): void {
    this.estrategia = estrategia;
  }

  trocarParametros(parametros: ParametrosRecomendacao): void {
    this.parametros = parametros;
  }

  ranquear(candidatos: readonly Profissional[], contexto: ContextoRecomendacao): CandidatoRanqueado[] {
    const elegiveis = this.filtrarElegiveis(candidatos, contexto);
    return this.estrategia
      .ranquear(elegiveis, contexto, this.parametros)
      .sort((a, b) => b.pontuacao - a.pontuacao);
  }

  private filtrarElegiveis(
    candidatos: readonly Profissional[],
    contexto: ContextoRecomendacao,
  ): Profissional[] {
    const papelRequerido: Papel = contexto.papel.papel;
    const jaEscalados = new Set(contexto.idsEscalados());
    return candidatos.filter(
      (candidato) =>
        candidato.atuaComo(papelRequerido) &&
        candidato.estaDisponivelEm(contexto.projeto.periodoFiltragens) &&
        !jaEscalados.has(candidato.id),
    );
  }
}
