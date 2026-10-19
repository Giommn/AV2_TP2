import { RegistroPrototipos } from '../domain/entities/projetos/registro-prototipos.js';
import { RegistroFabricasProjeto } from '../application/factories/registro-fabricas-projeto.js';
import { FabricaDocumentario } from '../application/factories/fabrica-documentario.js';
import { FabricaAnimacao } from '../application/factories/fabrica-animacao.js';
import { FabricaPublicitario } from '../application/factories/fabrica-publicitario.js';
import { FabricaFiccao } from '../application/factories/fabrica-ficcao.js';
import { ServicoConvite } from '../application/services/servico-convite.js';
import { ServicoRecomendacao } from '../application/services/servico-recomendacao.js';
import { gerarProfissionais, gerarProfissionaisFallback } from '../infrastructure/persistence/gerador-profissionais.js';
import {
  RepositorioConvitesMemoria,
  RepositorioEquipesMemoria,
  RepositorioProfissionaisMemoria,
  RepositorioProjetosMemoria,
  RepositorioRecomendacoesMemoria,
} from '../infrastructure/persistence/repositorios-memoria.js';
import { BarramentoEventosLocal } from '../infrastructure/events/barramento-eventos-local.js';
import { ObservadorAuditoria } from '../infrastructure/observers/observador-auditoria.js';
import { ObservadorEmail } from '../infrastructure/observers/observador-email.js';
import { ObservadorMensageria } from '../infrastructure/observers/observador-mensageria.js';
import { ObservadorAtualizacaoEquipe } from '../infrastructure/observers/observador-atualizacao-equipe.js';
import { TIPOS_EVENTO } from '../domain/events/eventos.js';
import type { DependenciasOrquestrador } from '../application/orchestration/orquestrador-composicao-equipe.js';

export interface ObservadoresAplicacao {
  readonly auditoria: ObservadorAuditoria;
  readonly email: ObservadorEmail;
  readonly mensageria: ObservadorMensageria;
  readonly atualizacaoEquipe: ObservadorAtualizacaoEquipe;
}

export interface DependenciasAplicacao {
  readonly repositorioProfissionais: RepositorioProfissionaisMemoria;
  readonly repositorioProjetos: RepositorioProjetosMemoria;
  readonly repositorioEquipes: RepositorioEquipesMemoria;
  readonly repositorioConvites: RepositorioConvitesMemoria;
  readonly repositorioRecomendacoes: RepositorioRecomendacoesMemoria;
  readonly barramento: BarramentoEventosLocal;
  readonly registroPrototipos: RegistroPrototipos;
  readonly registroFabricas: RegistroFabricasProjeto;
  readonly observadores: ObservadoresAplicacao;
  readonly servicoConvite: ServicoConvite;
  readonly servicoRecomendacao: ServicoRecomendacao;
}

export function construirAplicacao(): DependenciasAplicacao {
  const repositorioProfissionais = new RepositorioProfissionaisMemoria(gerarProfissionais());
  const repositorioProjetos = new RepositorioProjetosMemoria();
  const repositorioEquipes = new RepositorioEquipesMemoria();
  const repositorioConvites = new RepositorioConvitesMemoria();
  const repositorioRecomendacoes = new RepositorioRecomendacoesMemoria();

  const barramento = new BarramentoEventosLocal();
  const observadores: ObservadoresAplicacao = {
    auditoria: new ObservadorAuditoria(),
    email: new ObservadorEmail(),
    mensageria: new ObservadorMensageria(),
    atualizacaoEquipe: new ObservadorAtualizacaoEquipe(repositorioEquipes, barramento),
  };
  barramento.inscrever(observadores.auditoria);
  barramento.inscrever(observadores.email);
  barramento.inscrever(observadores.mensageria);
  barramento.inscreverPorTipo(TIPOS_EVENTO.CONVITE_ACEITO, observadores.atualizacaoEquipe);
  barramento.inscreverPorTipo(TIPOS_EVENTO.CONVITE_RECUSADO, observadores.atualizacaoEquipe);

  const registroPrototipos = RegistroPrototipos.criarPadrao();
  const registroFabricas = new RegistroFabricasProjeto();
  registroFabricas.registrar(new FabricaDocumentario(registroPrototipos, barramento));
  registroFabricas.registrar(new FabricaAnimacao(registroPrototipos, barramento));
  registroFabricas.registrar(new FabricaPublicitario(registroPrototipos, barramento));
  registroFabricas.registrar(new FabricaFiccao(registroPrototipos, barramento));

  const servicoConvite = new ServicoConvite(repositorioConvites, barramento);

  const deps: DependenciasOrquestrador = {
    repositorioProfissionais,
    repositorioProjetos,
    repositorioEquipes,
    repositorioConvites,
    repositorioRecomendacoes,
    servicoConvite,
    barramento,
    provedorFallback: gerarProfissionaisFallback,
  };

  const servicoRecomendacao = new ServicoRecomendacao(registroFabricas, deps);

  return {
    repositorioProfissionais,
    repositorioProjetos,
    repositorioEquipes,
    repositorioConvites,
    repositorioRecomendacoes,
    barramento,
    registroPrototipos,
    registroFabricas,
    observadores,
    servicoConvite,
    servicoRecomendacao,
  };
}
