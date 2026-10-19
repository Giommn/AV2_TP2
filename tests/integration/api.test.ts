import { describe, expect, it } from 'vitest';
import { construirAplicacao } from '../../src/composition/container.js';
import { construirServidor } from '../../src/interfaces/http/servidor.js';

describe('API HTTP (Fastify)', () => {
  it('responde ao health check', async () => {
    const servidor = construirServidor(construirAplicacao());
    const resposta = await servidor.inject({ method: 'GET', url: '/saude' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ status: 'ok', servico: 'cinebridge-recomendacao' });
  });

  it('lista os prototipos disponiveis para clonagem', async () => {
    const servidor = construirServidor(construirAplicacao());
    const resposta = await servidor.inject({ method: 'GET', url: '/prototipos' });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toHaveLength(4);
  });

  it('compõe a equipe e cria convites com sucesso', async () => {
    const servidor = construirServidor(construirAplicacao());
    const resposta = await servidor.inject({
      method: 'POST',
      url: '/recomendacoes/equipe',
      payload: { tipoCaptacao: 'FICCAO', orcamentoTotal: 600000 },
    });

    expect(resposta.statusCode).toBe(201);
    const corpo = resposta.json();
    expect(corpo.equipe.membros.length).toBeGreaterThan(0);
    expect(corpo.convites).toHaveLength(corpo.equipe.membros.length);
    expect(corpo.recomendacoes.length).toBe(corpo.equipe.membros.length);
  });

  it('permite responder a um convite', async () => {
    const servidor = construirServidor(construirAplicacao());
    const criacao = await servidor.inject({
      method: 'POST',
      url: '/recomendacoes/equipe',
      payload: { tipoCaptacao: 'ANIMACAO', orcamentoTotal: 400000 },
    });
    const conviteId = criacao.json().convites[0].id as string;

    const resposta = await servidor.inject({
      method: 'POST',
      url: `/convites/${conviteId}/resposta`,
      payload: { aceito: true },
    });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ id: conviteId, status: 'ACEITO' });
  });

  it('retorna 422 para tipo de captacao invalido', async () => {
    const servidor = construirServidor(construirAplicacao());
    const resposta = await servidor.inject({
      method: 'POST',
      url: '/recomendacoes/equipe',
      payload: { tipoCaptacao: 'INEXISTENTE', orcamentoTotal: 1000 },
    });

    expect(resposta.statusCode).toBe(422);
  });

  it('retorna 404 para convite inexistente', async () => {
    const servidor = construirServidor(construirAplicacao());
    const resposta = await servidor.inject({
      method: 'POST',
      url: '/convites/nao-existe/resposta',
      payload: { aceito: true },
    });

    expect(resposta.statusCode).toBe(404);
  });
});
