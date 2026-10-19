import { describe, expect, it } from 'vitest';
import { VetorCompetencias } from '../../src/domain/value-objects/vetor-competencias.js';

describe('VetorCompetencias', () => {
  it('calcula similaridade de cosseno igual a 1 para vetores identicos', () => {
    const a = VetorCompetencias.criar({ fotografia: 0.8, iluminacao: 0.6 });
    const b = VetorCompetencias.criar({ fotografia: 0.8, iluminacao: 0.6 });
    expect(a.similaridadeCosseno(b)).toBeCloseTo(1, 6);
  });

  it('retorna 0 para vetores ortogonais sem competencias em comum', () => {
    const a = VetorCompetencias.criar({ fotografia: 1 });
    const b = VetorCompetencias.criar({ roteiro: 1 });
    expect(a.similaridadeCosseno(b)).toBe(0);
  });

  it('retorna 0 quando um dos vetores e vazio', () => {
    const vazio = VetorCompetencias.vazio();
    const cheio = VetorCompetencias.criar({ vfx: 1 });
    expect(vazio.similaridadeCosseno(cheio)).toBe(0);
    expect(cheio.similaridadeCosseno(vazio)).toBe(0);
  });

  it('limita valores entre 0 e 1 e calcula a media', () => {
    const vetor = VetorCompetencias.criar({ a: 2, b: -1, c: 0.5 });
    expect(vetor.obter('a')).toBe(1);
    expect(vetor.obter('b')).toBe(0);
    expect(vetor.media()).toBeCloseTo(0.5, 6);
  });
});
