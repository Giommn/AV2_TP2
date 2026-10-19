import { randomUUID } from 'node:crypto';
import { Equipe } from '../../domain/entities/equipe.js';
import { MembroEquipe } from '../../domain/entities/membro-equipe.js';
import { Recomendacao } from '../../domain/entities/recomendacao.js';
import { EquipeCompostaEvento, RecomendacaoGeradaEvento } from '../../domain/events/eventos.js';
import { ErroNegocio } from '../erros.js';
import { ContextoRecomendacao } from '../recommendation/contexto-recomendacao.js';
import type { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import type { CandidatoRanqueado } from '../recommendation/candidato-ranqueado.js';
import { CalculadorCompatibilidadeEquipe, type MetricasCompatibilidade } from '../visitors/calculador-compatibilidade.js';
import { GeradorRelatorioProdutor, type RelatorioProdutor } from '../visitors/gerador-relatorio.js';
import type { FabricaProjeto } from '../factories/fabrica-projeto.js';
import type { ServicoConvite } from '../services/servico-convite.js';
import type { Violacao } from '../visitors/validadores-especializados.js';
import type { RelatorioEspecializado } from '../notifiers/notificador-projeto.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { Convite } from '../../domain/entities/convite.js';
import type { Profissional } from '../../domain/entities/profissional.js';
import type { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import type { Papel } from '../../domain/enums/papel.js';
import type {
  RepositorioConvites,
  RepositorioEquipes,
  RepositorioProfissionais,
  RepositorioProjetos,
  RepositorioRecomendacoes,
} from '../../domain/ports/repositorios.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export interface DependenciasOrquestrador {
  repositorioProfissionais: RepositorioProfissionais;
  repositorioProjetos: RepositorioProjetos;
  repositorioEquipes: RepositorioEquipes;
  repositorioConvites: RepositorioConvites;
  repositorioRecomendacoes: RepositorioRecomendacoes;
  servicoConvite: ServicoConvite;
  barramento: BarramentoEventos;
  provedorFallback: (papel: Papel) => Profissional[];
}

export interface ResultadoComposicao {
  readonly projeto: Projeto;
  readonly equipe: Equipe;
  readonly recomendacoes: readonly Recomendacao[];
  readonly convites: readonly Convite[];
  readonly violacoesProjeto: readonly Violacao[];
  readonly violacoesEquipe: readonly Violacao[];
  readonly metricas: MetricasCompatibilidade;
  readonly relatorioEspecializado: RelatorioEspecializado;
  readonly relatorioProdutor: RelatorioProdutor;
}

export class OrquestradorEquipe {
  constructor(
    private readonly fabrica: FabricaProjeto,
    private readonly deps: DependenciasOrquestrador,
  ) {}

  async compor(projeto: Projeto): Promise<ResultadoComposicao> {
    const profissionaisDisponiveis = await this.deps.repositorioProfissionais.listar();
    const mapaProfissionais = new Map<string, Profissional>(
      profissionaisDisponiveis.map((profissional) => [profissional.id, profissional]),
    );

    const validador = this.fabrica.criarValidador();
    const violacoesProjeto = validador.validarProjeto(projeto);
    this.garantirSemErros(violacoesProjeto);

    const projetoNormalizado = this.fabrica.normalizarProjeto(projeto);
    await this.deps.repositorioProjetos.salvar(projetoNormalizado);

    const motor = this.fabrica.criarRecomendador();
    if (projetoNormalizado.estrategiaPreferida) {
      motor.trocarEstrategia(projetoNormalizado.estrategiaPreferida);
    }
    const notificador = this.fabrica.criarNotificador();

    const equipe = new Equipe(randomUUID(), projetoNormalizado.id);
    const recomendacoes: Recomendacao[] = [];
    const membrosProfissionais: Profissional[] = [];
    const idsSelecionados = new Set<string>();

    const papeisOrdenados = [...projetoNormalizado.papeisObrigatorios].sort(
      (a, b) => b.peso - a.peso,
    );

    for (const papel of papeisOrdenados) {
      const resultado = this.selecionarCandidato(
        papel,
        profissionaisDisponiveis,
        idsSelecionados,
        membrosProfissionais,
        projetoNormalizado,
        equipe,
        motor,
      );
      if (!resultado) {
        continue;
      }
      const { escolhido, ranqueados, origemDados } = resultado;

      const recomendacao = new Recomendacao({
        id: randomUUID(),
        projetoId: projetoNormalizado.id,
        papel: papel.papel,
        estrategiaUsada: motor.nomeEstrategia,
        origemDados,
        candidatos: ranqueados.map((candidato) => candidato.paraRecomendado()),
      });
      recomendacoes.push(recomendacao);
      await this.deps.repositorioRecomendacoes.salvar(recomendacao);

      idsSelecionados.add(escolhido.profissional.id);
      membrosProfissionais.push(escolhido.profissional);
      mapaProfissionais.set(escolhido.profissional.id, escolhido.profissional);

      equipe.adicionarMembro(
        new MembroEquipe({
          profissionalId: escolhido.profissional.id,
          nomeProfissional: escolhido.profissional.nome,
          papel: papel.papel,
          cacheNegociado: escolhido.profissional.precoMinimo,
        }),
      );

      await notificador.notificar(
        new RecomendacaoGeradaEvento(
          projetoNormalizado.id,
          papel.papel,
          motor.nomeEstrategia,
          ranqueados.length,
          escolhido.profissional.id,
          origemDados,
        ),
      );
    }

    await this.deps.repositorioEquipes.salvar(equipe);
    const violacoesEquipe = validador.validarEquipe(equipe, projetoNormalizado);

    await notificador.notificar(
      new EquipeCompostaEvento(
        equipe.id,
        projetoNormalizado.id,
        equipe.membros.length,
        equipe.custoTotal(),
      ),
    );

    const relatorioEspecializado = notificador.gerarRelatorio(
      projetoNormalizado,
      equipe,
      recomendacoes,
    );

    const convites = await this.deps.servicoConvite.gerarConvites(equipe, projetoNormalizado);

    const metricas = new CalculadorCompatibilidadeEquipe(mapaProfissionais).calcular(equipe);
    const relatorioProdutor = new GeradorRelatorioProdutor().gerar(
      projetoNormalizado,
      equipe,
      recomendacoes,
      metricas,
    );

    return {
      projeto: projetoNormalizado,
      equipe,
      recomendacoes,
      convites,
      violacoesProjeto,
      violacoesEquipe,
      metricas,
      relatorioEspecializado,
      relatorioProdutor,
    };
  }

  private selecionarCandidato(
    papel: PapelRequerido,
    profissionaisDisponiveis: readonly Profissional[],
    idsSelecionados: ReadonlySet<string>,
    membrosProfissionais: readonly Profissional[],
    projeto: Projeto,
    equipe: Equipe,
    motor: MotorRecomendacao,
  ):
    | {
        escolhido: CandidatoRanqueado;
        ranqueados: CandidatoRanqueado[];
        origemDados: 'REPOSITORIO' | 'FALLBACK';
      }
    | undefined {
    const doRepositorio = profissionaisDisponiveis.filter(
      (profissional) => profissional.atuaComo(papel.papel) && !idsSelecionados.has(profissional.id),
    );
    const origemDados: 'REPOSITORIO' | 'FALLBACK' =
      doRepositorio.length > 0 ? 'REPOSITORIO' : 'FALLBACK';
    const base = doRepositorio.length > 0 ? doRepositorio : this.deps.provedorFallback(papel.papel);
    const contexto = new ContextoRecomendacao(
      projeto,
      papel,
      membrosProfissionais,
      Math.max(0, projeto.orcamentoTotal - equipe.custoTotal()),
    );
    const ranqueados = motor.ranquear(base, contexto);
    const escolhido = ranqueados[0];
    if (!escolhido) {
      return undefined;
    }
    return { escolhido, ranqueados, origemDados };
  }

  private garantirSemErros(violacoes: readonly Violacao[]): void {
    const erros = violacoes.filter((violacao) => violacao.severidade === 'ERRO');
    if (erros.length > 0) {
      const mensagens = erros.map((erro) => `${erro.codigo}: ${erro.mensagem}`).join(' | ');
      throw new ErroNegocio(`Projeto invalido: ${mensagens}`, 'VALIDACAO_PROJETO');
    }
  }
}
