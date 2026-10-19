import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { NomeEstrategia } from '../../domain/enums/nome-estrategia.js';
import { Papel } from '../../domain/enums/papel.js';
import { EstiloAnimacao } from '../../domain/enums/estilo-animacao.js';
import { Localizacao } from '../../domain/value-objects/localizacao.js';
import { IntervaloDatas } from '../../domain/value-objects/intervalo-datas.js';
import { VetorCompetencias } from '../../domain/value-objects/vetor-competencias.js';
import { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import { ProjetoDocumentario } from '../../domain/entities/projetos/projeto-documentario.js';
import { ProjetoAnimacao } from '../../domain/entities/projetos/projeto-animacao.js';
import { ProjetoPublicitario } from '../../domain/entities/projetos/projeto-publicitario.js';
import { ProjetoFiccao } from '../../domain/entities/projetos/projeto-ficcao.js';
import { ErroNegocio } from '../../application/erros.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { EntradaProjeto } from '../../application/services/servico-recomendacao.js';
import type { ResultadoComposicao } from '../../application/orchestration/orquestrador-composicao-equipe.js';
import type { Convite } from '../../domain/entities/convite.js';
import type { Violacao } from '../../application/visitors/validadores-especializados.js';

function comoRegistro(valor: unknown, mensagem: string): Record<string, unknown> {
  if (typeof valor !== 'object' || valor === null) {
    throw new ErroNegocio(mensagem);
  }
  return valor as Record<string, unknown>;
}

function textoOpcional(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined;
}

function numeroOpcional(valor: unknown): number | undefined {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : undefined;
}

function mapearLocalizacao(valor: unknown): Localizacao {
  const registro = comoRegistro(valor, 'Localizacao invalida');
  const cidade = registro.cidade;
  const uf = registro.uf;
  const pais = registro.pais;
  if (typeof cidade !== 'string' || typeof uf !== 'string' || typeof pais !== 'string') {
    throw new ErroNegocio('Localizacao exige cidade, uf e pais');
  }
  return new Localizacao(cidade, uf, pais);
}

function mapearPeriodo(valor: unknown): IntervaloDatas {
  const registro = comoRegistro(valor, 'Periodo invalido');
  const inicio = new Date(String(registro.inicio));
  const fim = new Date(String(registro.fim));
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    throw new ErroNegocio('Periodo exige datas inicio e fim validas');
  }
  return new IntervaloDatas(inicio, fim);
}

function mapearPapeis(valor: unknown): PapelRequerido[] {
  if (!Array.isArray(valor)) {
    throw new ErroNegocio('papeisObrigatorios deve ser uma lista');
  }
  return valor.map((item) => {
    const registro = comoRegistro(item, 'Papel requerido invalido');
    const papel = registro.papel;
    if (typeof papel !== 'string' || !Object.values(Papel).includes(papel as Papel)) {
      throw new ErroNegocio('Papel requerido invalido');
    }
    const peso = numeroOpcional(registro.peso) ?? 1;
    const competencias = registro.competencias;
    const vetor =
      typeof competencias === 'object' && competencias !== null
        ? VetorCompetencias.criar(competencias as Record<string, number>)
        : VetorCompetencias.vazio();
    return new PapelRequerido(papel as Papel, peso, vetor);
  });
}

export function mapearHttpParaDadosProjeto(corpo: unknown): EntradaProjeto {
  const registro = comoRegistro(corpo, 'Corpo da requisicao invalido');
  const tipoCaptacao = registro.tipoCaptacao;
  if (
    typeof tipoCaptacao !== 'string' ||
    !Object.values(TipoCaptacao).includes(tipoCaptacao as TipoCaptacao)
  ) {
    throw new ErroNegocio('Campo tipoCaptacao obrigatorio e deve ser valido');
  }
  const orcamentoTotal = numeroOpcional(registro.orcamentoTotal);
  if (orcamentoTotal === undefined) {
    throw new ErroNegocio('Campo orcamentoTotal obrigatorio e numerico');
  }

  const dados: EntradaProjeto = {
    tipoCaptacao: tipoCaptacao as TipoCaptacao,
    orcamentoTotal,
  };

  const titulo = textoOpcional(registro.titulo);
  if (titulo !== undefined) dados.titulo = titulo;
  const genero = textoOpcional(registro.genero);
  if (genero !== undefined) dados.genero = genero;
  const duracao = numeroOpcional(registro.duracaoEstimadaMinutos);
  if (duracao !== undefined) dados.duracaoEstimadaMinutos = duracao;
  if (registro.dataEntrega !== undefined) {
    const dataEntrega = new Date(String(registro.dataEntrega));
    if (Number.isNaN(dataEntrega.getTime())) {
      throw new ErroNegocio('dataEntrega invalida');
    }
    dados.dataEntrega = dataEntrega;
  }
  if (registro.localizacao !== undefined) {
    dados.localizacaoFiltragens = mapearLocalizacao(registro.localizacao);
  }
  if (registro.periodo !== undefined) {
    dados.periodoFiltragens = mapearPeriodo(registro.periodo);
  }
  if (registro.papeisObrigatorios !== undefined) {
    dados.papeisObrigatorios = mapearPapeis(registro.papeisObrigatorios);
  }
  if (
    typeof registro.estrategiaPreferida === 'string' &&
    Object.values(NomeEstrategia).includes(registro.estrategiaPreferida as NomeEstrategia)
  ) {
    dados.estrategiaPreferida = registro.estrategiaPreferida as NomeEstrategia;
  }
  if (typeof registro.metaProducao === 'object' && registro.metaProducao !== null) {
    dados.metaProducao = registro.metaProducao as Record<string, unknown>;
  }
  const margem = numeroOpcional(registro.margemReservaImprevistos);
  if (margem !== undefined) dados.margemReservaImprevistos = margem;
  const fps = numeroOpcional(registro.taxaQuadrosPorSegundo);
  if (fps !== undefined) dados.taxaQuadrosPorSegundo = fps;
  if (
    typeof registro.estiloAnimacao === 'string' &&
    Object.values(EstiloAnimacao).includes(registro.estiloAnimacao as EstiloAnimacao)
  ) {
    dados.estiloAnimacao = registro.estiloAnimacao as EstiloAnimacao;
  }
  const cliente = textoOpcional(registro.clienteAnunciante);
  if (cliente !== undefined) dados.clienteAnunciante = cliente;
  const prazo = numeroOpcional(registro.prazoVeiculacaoDias);
  if (prazo !== undefined) dados.prazoVeiculacaoDias = prazo;
  const complexidade = numeroOpcional(registro.complexidadeCenografia);
  if (complexidade !== undefined) dados.complexidadeCenografia = complexidade;

  return dados;
}

function serializarProjeto(projeto: Projeto): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: projeto.id,
    titulo: projeto.titulo,
    genero: projeto.genero,
    tipoCaptacao: projeto.tipoCaptacao,
    duracaoEstimadaMinutos: projeto.duracaoEstimadaMinutos,
    orcamentoTotal: projeto.orcamentoTotal,
    dataEntrega: projeto.dataEntrega.toISOString(),
    localizacaoFiltragens: {
      cidade: projeto.localizacaoFiltragens.cidade,
      uf: projeto.localizacaoFiltragens.uf,
      pais: projeto.localizacaoFiltragens.pais,
    },
    periodoFiltragens: {
      inicio: projeto.periodoFiltragens.inicio.toISOString(),
      fim: projeto.periodoFiltragens.fim.toISOString(),
      duracaoDias: projeto.periodoFiltragens.duracaoDias(),
    },
    papeisObrigatorios: projeto.papeisObrigatorios.map((papel) => ({
      papel: papel.papel,
      peso: papel.peso,
      competenciasDesejadas: papel.competenciasDesejadas.paraObjeto(),
    })),
    estrategiaPreferida: projeto.estrategiaPreferida,
    metaProducao: projeto.metaProducao,
  };
  if (projeto instanceof ProjetoDocumentario) {
    base.margemReservaImprevistos = projeto.margemReservaImprevistos;
  }
  if (projeto instanceof ProjetoAnimacao) {
    base.taxaQuadrosPorSegundo = projeto.taxaQuadrosPorSegundo;
    base.estiloAnimacao = projeto.estiloAnimacao;
  }
  if (projeto instanceof ProjetoPublicitario) {
    base.clienteAnunciante = projeto.clienteAnunciante;
    base.prazoVeiculacaoDias = projeto.prazoVeiculacaoDias;
  }
  if (projeto instanceof ProjetoFiccao) {
    base.complexidadeCenografia = projeto.complexidadeCenografia;
  }
  return base;
}

function serializarViolacoes(violacoes: readonly Violacao[]): Violacao[] {
  return violacoes.map((violacao) => ({ ...violacao }));
}

export function serializarConvite(convite: Convite): Record<string, unknown> {
  return {
    id: convite.id,
    equipeId: convite.equipeId,
    profissionalId: convite.profissionalId,
    papel: convite.papel,
    cacheOferecido: convite.cacheOferecido,
    status: convite.status,
    dataCriacao: convite.dataCriacao.toISOString(),
    dataResposta: convite.dataResposta?.toISOString(),
  };
}

export function serializarResultado(resultado: ResultadoComposicao): Record<string, unknown> {
  return {
    projeto: serializarProjeto(resultado.projeto),
    equipe: {
      id: resultado.equipe.id,
      projetoId: resultado.equipe.projetoId,
      status: resultado.equipe.status,
      custoTotal: resultado.equipe.custoTotal(),
      membros: resultado.equipe.membros.map((membro) => ({
        profissionalId: membro.profissionalId,
        nomeProfissional: membro.nomeProfissional,
        papel: membro.papel,
        cacheNegociado: membro.cacheNegociado,
        confirmado: membro.confirmado,
      })),
    },
    recomendacoes: resultado.recomendacoes.map((recomendacao) => ({
      id: recomendacao.id,
      projetoId: recomendacao.projetoId,
      papel: recomendacao.papel,
      estrategiaUsada: recomendacao.estrategiaUsada,
      origemDados: recomendacao.origemDados,
      candidatos: recomendacao.candidatos.map((candidato) => ({
        profissionalId: candidato.profissionalId,
        nomeProfissional: candidato.nomeProfissional,
        pontuacao: candidato.pontuacao,
        componentes: candidato.componentes,
      })),
    })),
    convites: resultado.convites.map((convite) => serializarConvite(convite)),
    violacoesProjeto: serializarViolacoes(resultado.violacoesProjeto),
    violacoesEquipe: serializarViolacoes(resultado.violacoesEquipe),
    metricas: resultado.metricas,
    relatorioEspecializado: resultado.relatorioEspecializado,
    relatorioProdutor: resultado.relatorioProdutor,
  };
}
