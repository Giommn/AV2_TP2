import { NomeEstrategia } from '../../../domain/enums/nome-estrategia.js';
import { ErroNegocio } from '../../erros.js';
import { EstrategiaSimilaridadeCosseno } from './similaridade-cosseno.js';
import { EstrategiaFiltragemColaborativa } from './filtragem-colaborativa.js';
import { EstrategiaOrcamentoReduzido } from './orcamento-reduzido.js';
import type { EstrategiaRecomendacao } from './estrategia-recomendacao.js';

const CRIADORES: Readonly<Record<NomeEstrategia, () => EstrategiaRecomendacao>> = {
  [NomeEstrategia.SIMILARIDADE_COSSENO]: () => new EstrategiaSimilaridadeCosseno(),
  [NomeEstrategia.FILTRAGEM_COLABORATIVA]: () => new EstrategiaFiltragemColaborativa(),
  [NomeEstrategia.ORCAMENTO_REDUZIDO]: () => new EstrategiaOrcamentoReduzido(),
};

export function criarEstrategia(nome: NomeEstrategia): EstrategiaRecomendacao {
  const criador = CRIADORES[nome];
  if (!criador) {
    throw new ErroNegocio(`Estrategia de recomendacao desconhecida: ${nome}`);
  }
  return criador();
}
