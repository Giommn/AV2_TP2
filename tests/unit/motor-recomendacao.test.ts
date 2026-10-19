import { describe, expect, it } from 'vitest';
import { MotorRecomendacao } from '../../src/application/recommendation/motor-recomendacao.js';
import { ContextoRecomendacao } from '../../src/application/recommendation/contexto-recomendacao.js';
import { RegistroPrototipos } from '../../src/domain/entities/projetos/registro-prototipos.js';
import { Profissional } from '../../src/domain/entities/profissional.js';
import { VetorCompetencias } from '../../src/domain/value-objects/vetor-competencias.js';
import { Localizacao } from '../../src/domain/value-objects/localizacao.js';
import { IntervaloDatas } from '../../src/domain/value-objects/intervalo-datas.js';
import { Papel } from '../../src/domain/enums/papel.js';
import { TipoCaptacao } from '../../src/domain/enums/tipo-captacao.js';
import { NomeEstrategia } from '../../src/domain/enums/nome-estrategia.js';

function criarProfissional(params: {
  id: string;
  competencias: Record<string, number>;
  preco: number;
  media: number;
}): Profissional {
  return new Profissional({
    id: params.id,
    nome: `Nome ${params.id}`,
    papeis: [Papel.DIRETOR],
    competencias: VetorCompetencias.criar(params.competencias),
    precoMinimo: params.preco,
    precoMaximo: params.preco,
    disponibilidade: [new IntervaloDatas(new Date('2026-01-01'), new Date('2026-12-31'))],
    localizacao: new Localizacao('Sao Paulo', 'SP', 'Brasil'),
    mediaAvaliacoes: params.media,
    totalAvaliacoes: 20,
    afinidades: {},
  });
}

describe('MotorRecomendacao (Strategy)', () => {
  const projeto = RegistroPrototipos.criarPadrao().obter(TipoCaptacao.FICCAO).clonar();
  const papel = projeto.papeisObrigatorios.find((requerido) => requerido.papel === Papel.DIRETOR);
  if (!papel) {
    throw new Error('Papel DIRETOR ausente no prototipo de ficcao');
  }

  const candidatoQualidade = criarProfissional({
    id: 'A',
    competencias: { direcao: 1, narrativa: 1, lideranca: 1 },
    preco: 4000,
    media: 4.5,
  });
  const candidatoEconomico = criarProfissional({
    id: 'B',
    competencias: { direcao: 0.4, narrativa: 0, lideranca: 0 },
    preco: 1000,
    media: 3,
  });

  const contexto = new ContextoRecomendacao(projeto, papel, [], 4000);

  it('ranqueia em ordem decrescente com a estrategia de similaridade', () => {
    const motor = MotorRecomendacao.padrao();
    const ranqueados = motor.ranquear([candidatoEconomico, candidatoQualidade], contexto);

    expect(ranqueados).toHaveLength(2);
    expect(ranqueados[0]?.profissional.id).toBe('A');
    expect(ranqueados[0]?.pontuacao).toBeGreaterThan(ranqueados[1]?.pontuacao ?? 0);
    expect(motor.nomeEstrategia).toBe(NomeEstrategia.SIMILARIDADE_COSSENO);
  });

  it('troca a estrategia dinamicamente priorizando menor custo', () => {
    const motor = MotorRecomendacao.padrao();
    motor.trocarEstrategia(NomeEstrategia.ORCAMENTO_REDUZIDO);
    const ranqueados = motor.ranquear([candidatoQualidade, candidatoEconomico], contexto);

    expect(motor.nomeEstrategia).toBe(NomeEstrategia.ORCAMENTO_REDUZIDO);
    expect(ranqueados[0]?.profissional.id).toBe('B');
  });
});
