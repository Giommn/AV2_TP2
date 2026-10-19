import { Profissional } from '../../domain/entities/profissional.js';
import { VetorCompetencias } from '../../domain/value-objects/vetor-competencias.js';
import { Localizacao } from '../../domain/value-objects/localizacao.js';
import { IntervaloDatas } from '../../domain/value-objects/intervalo-datas.js';
import { Papel } from '../../domain/enums/papel.js';
import { competenciasDe } from '../../domain/competencias-papel.js';

const CIDADES_POR_UF: Readonly<Record<string, readonly string[]>> = {
  SP: ['Sao Paulo', 'Campinas', 'Santos'],
  RJ: ['Rio de Janeiro', 'Niteroi', 'Petropolis'],
  MG: ['Belo Horizonte', 'Uberlandia'],
  RS: ['Porto Alegre', 'Caxias do Sul'],
  BA: ['Salvador', 'Feira de Santana'],
  PE: ['Recife', 'Olinda'],
};

const UFS = Object.keys(CIDADES_POR_UF);

function criarAleatorio(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escolher<T>(rng: () => number, itens: readonly T[]): T {
  const indice = Math.floor(rng() * itens.length);
  return itens[indice] as T;
}

function disponibilidadeAmpla(): readonly IntervaloDatas[] {
  return [new IntervaloDatas(new Date('2026-01-01'), new Date('2026-12-31'))];
}

interface RegistroProfissional {
  id: string;
  nome: string;
  papeis: Papel[];
  competencias: Record<string, number>;
  precoMinimo: number;
  precoMaximo: number;
  localizacao: Localizacao;
  mediaAvaliacoes: number;
  totalAvaliacoes: number;
}

export function gerarProfissionais(quantidadePorPapel = 8): Profissional[] {
  const rng = criarAleatorio(20260418);
  const papeis = Object.values(Papel);
  const registros: RegistroProfissional[] = [];
  let indice = 0;

  for (const papel of papeis) {
    for (let i = 0; i < quantidadePorPapel; i += 1) {
      indice += 1;
      const id = `prof-${String(indice).padStart(3, '0')}`;
      const nome = `Profissional ${String(indice).padStart(3, '0')}`;
      const competencias: Record<string, number> = {};
      for (const competencia of competenciasDe(papel)) {
        competencias[competencia] = arredondar(0.5 + rng() * 0.5);
      }
      const uf = escolher(rng, UFS);
      const cidade = escolher(rng, CIDADES_POR_UF[uf] as readonly string[]);
      const localizacao = rng() < 0.15 ? Localizacao.remoto() : new Localizacao(cidade, uf, 'Brasil');
      const precoMinimo = 1200 + Math.floor(rng() * 7800);
      const precoMaximo = Math.round(precoMinimo * (1.2 + rng() * 0.4));
      registros.push({
        id,
        nome,
        papeis: [papel],
        competencias,
        precoMinimo,
        precoMaximo,
        localizacao,
        mediaAvaliacoes: arredondar(2.8 + rng() * 2.1),
        totalAvaliacoes: 5 + Math.floor(rng() * 75),
      });
    }
  }

  const ids = registros.map((registro) => registro.id);

  return registros.map((registro) => {
    const afinidades: Record<string, number> = {};
    for (const outroId of ids) {
      if (outroId !== registro.id) {
        afinidades[outroId] = arredondar(rng() * 0.8);
      }
    }
    return new Profissional({
      id: registro.id,
      nome: registro.nome,
      papeis: registro.papeis,
      competencias: VetorCompetencias.criar(registro.competencias),
      precoMinimo: registro.precoMinimo,
      precoMaximo: registro.precoMaximo,
      disponibilidade: disponibilidadeAmpla(),
      localizacao: registro.localizacao,
      mediaAvaliacoes: registro.mediaAvaliacoes,
      totalAvaliacoes: registro.totalAvaliacoes,
      afinidades,
    });
  });
}

export function gerarProfissionaisFallback(papel: Papel, quantidade = 3): Profissional[] {
  const rng = criarAleatorio(987654321 + Object.values(Papel).indexOf(papel));
  const profissionais: Profissional[] = [];
  for (let i = 0; i < quantidade; i += 1) {
    const competencias: Record<string, number> = {};
    for (const competencia of competenciasDe(papel)) {
      competencias[competencia] = arredondar(0.6 + rng() * 0.3);
    }
    const precoMinimo = 1500 + i * 250;
    profissionais.push(
      new Profissional({
        id: `fallback-${papel}-${i + 1}`,
        nome: `Reserva ${papel} ${i + 1}`,
        papeis: [papel],
        competencias: VetorCompetencias.criar(competencias),
        precoMinimo,
        precoMaximo: Math.round(precoMinimo * 1.3),
        disponibilidade: disponibilidadeAmpla(),
        localizacao: Localizacao.remoto(),
        mediaAvaliacoes: arredondar(3.5 + rng() * 1),
        totalAvaliacoes: 10 + Math.floor(rng() * 20),
        afinidades: {},
      }),
    );
  }
  return profissionais;
}

function arredondar(valor: number): number {
  return Math.round(valor * 10000) / 10000;
}
