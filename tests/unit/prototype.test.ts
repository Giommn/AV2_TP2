import { describe, expect, it } from 'vitest';
import { RegistroPrototipos } from '../../src/domain/entities/projetos/registro-prototipos.js';
import { ProjetoDocumentario } from '../../src/domain/entities/projetos/projeto-documentario.js';
import { ProjetoAnimacao } from '../../src/domain/entities/projetos/projeto-animacao.js';
import { PapelRequerido } from '../../src/domain/entities/papel-requerido.js';
import { VetorCompetencias } from '../../src/domain/value-objects/vetor-competencias.js';
import { Papel } from '../../src/domain/enums/papel.js';
import { TipoCaptacao } from '../../src/domain/enums/tipo-captacao.js';

describe('Padrao Prototype', () => {
  it('clona um projeto a partir do registro aplicando sobrescritas pontuais', () => {
    const registro = RegistroPrototipos.criarPadrao();
    const prototipo = registro.obter(TipoCaptacao.DOCUMENTARIO);

    const clone = prototipo.clonar({ titulo: 'Documentario Clonado', orcamentoTotal: 123456 });

    expect(clone.titulo).toBe('Documentario Clonado');
    expect(clone.orcamentoTotal).toBe(123456);
    expect(prototipo.titulo).toBe('Prototipo Documentario');
    expect(prototipo.orcamentoTotal).toBe(250000);
  });

  it('realiza deep copy dos agregados protegendo o prototipo original', () => {
    const registro = RegistroPrototipos.criarPadrao();
    const prototipo = registro.obter(TipoCaptacao.FICCAO);
    const totalOriginal = prototipo.papeisObrigatorios.length;

    const clone = prototipo.clonar();

    expect(clone.papeisObrigatorios).not.toBe(prototipo.papeisObrigatorios);
    expect(clone.papeisObrigatorios[0]).not.toBe(prototipo.papeisObrigatorios[0]);
    expect(clone.periodoFiltragens).not.toBe(prototipo.periodoFiltragens);
    expect(clone.localizacaoFiltragens).not.toBe(prototipo.localizacaoFiltragens);
    expect(clone.metaProducao).not.toBe(prototipo.metaProducao);

    (clone.papeisObrigatorios as PapelRequerido[]).push(
      new PapelRequerido(Papel.VFX, 1, VetorCompetencias.criar({ vfx: 1 })),
    );

    expect(clone.papeisObrigatorios.length).toBe(totalOriginal + 1);
    expect(prototipo.papeisObrigatorios.length).toBe(totalOriginal);
  });

  it('preserva propriedades especificas das subclasses ao clonar', () => {
    const registro = RegistroPrototipos.criarPadrao();

    const doc = registro.obter(TipoCaptacao.DOCUMENTARIO).clonar();
    const anim = registro.obter(TipoCaptacao.ANIMACAO).clonar();

    expect(doc).toBeInstanceOf(ProjetoDocumentario);
    expect((doc as ProjetoDocumentario).margemReservaImprevistos).toBe(0.25);

    expect(anim).toBeInstanceOf(ProjetoAnimacao);
    expect((anim as ProjetoAnimacao).taxaQuadrosPorSegundo).toBe(24);
    expect(anim.localizacaoFiltragens.ehRemoto()).toBe(true);
  });
});
