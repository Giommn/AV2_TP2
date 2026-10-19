import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { ErroNegocio, ErroNaoEncontrado } from '../../application/erros.js';
import { mapearHttpParaDadosProjeto, serializarConvite, serializarResultado } from './mappers.js';
import type { DependenciasAplicacao } from '../../composition/container.js';

export function construirServidor(app: DependenciasAplicacao): FastifyInstance {
  const servidor = Fastify({ logger: false });

  servidor.get('/saude', async () => ({
    status: 'ok',
    servico: 'cinebridge-recomendacao',
  }));

  servidor.get('/prototipos', async () => app.registroPrototipos.listar());

  servidor.post('/recomendacoes/equipe', async (requisicao, resposta) => {
    const dados = mapearHttpParaDadosProjeto(requisicao.body);
    const resultado = await app.servicoRecomendacao.executar(dados);
    return resposta.status(201).send(serializarResultado(resultado));
  });

  servidor.post('/convites/:conviteId/resposta', async (requisicao, resposta) => {
    const parametros = requisicao.params as { conviteId?: string };
    const conviteId = parametros.conviteId;
    if (!conviteId) {
      throw new ErroNegocio('Identificador do convite obrigatorio');
    }
    const corpo = requisicao.body as { aceito?: unknown } | undefined;
    if (!corpo || typeof corpo.aceito !== 'boolean') {
      throw new ErroNegocio('Campo aceito deve ser booleano');
    }
    const convite = await app.servicoConvite.responder(conviteId, corpo.aceito);
    return resposta.status(200).send(serializarConvite(convite));
  });

  servidor.setErrorHandler((erro, _requisicao, resposta) => {
    if (erro instanceof ErroNaoEncontrado) {
      return resposta.status(404).send({ erro: erro.message, codigo: erro.codigo });
    }
    if (erro instanceof ErroNegocio) {
      return resposta.status(422).send({ erro: erro.message, codigo: erro.codigo });
    }
    const detalhe = erro instanceof Error ? erro.message : String(erro);
    return resposta.status(500).send({ erro: 'Erro interno', detalhe });
  });

  return servidor;
}
