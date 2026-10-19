import { PapelRequerido } from './papel-requerido.js';
import { Localizacao } from '../value-objects/localizacao.js';
import { IntervaloDatas } from '../value-objects/intervalo-datas.js';
import { TipoCaptacao } from '../enums/tipo-captacao.js';
import type { Papel } from '../enums/papel.js';
import type { NomeEstrategia } from '../enums/nome-estrategia.js';
import type { EstiloAnimacao } from '../enums/estilo-animacao.js';
import type { VisitanteProjeto } from '../visitors/visitante-projeto.js';

export interface DadosProjeto {
  id: string;
  titulo?: string;
  genero: string;
  duracaoEstimadaMinutos: number;
  orcamentoTotal: number;
  dataEntrega: Date;
  tipoCaptacao: TipoCaptacao;
  localizacaoFiltragens: Localizacao;
  periodoFiltragens: IntervaloDatas;
  papeisObrigatorios: readonly PapelRequerido[];
  estrategiaPreferida?: NomeEstrategia;
  metaProducao: Record<string, unknown>;
  margemReservaImprevistos?: number;
  taxaQuadrosPorSegundo?: number;
  estiloAnimacao?: EstiloAnimacao;
  clienteAnunciante?: string;
  prazoVeiculacaoDias?: number;
  complexidadeCenografia?: number;
}

export abstract class Projeto {
  readonly id: string;
  readonly titulo?: string;
  readonly genero: string;
  readonly duracaoEstimadaMinutos: number;
  readonly orcamentoTotal: number;
  readonly dataEntrega: Date;
  readonly tipoCaptacao: TipoCaptacao;
  readonly localizacaoFiltragens: Localizacao;
  readonly periodoFiltragens: IntervaloDatas;
  readonly papeisObrigatorios: readonly PapelRequerido[];
  readonly estrategiaPreferida?: NomeEstrategia;
  readonly metaProducao: Readonly<Record<string, unknown>>;

  protected constructor(dados: DadosProjeto) {
    this.id = dados.id;
    this.titulo = dados.titulo;
    this.genero = dados.genero;
    this.duracaoEstimadaMinutos = dados.duracaoEstimadaMinutos;
    this.orcamentoTotal = dados.orcamentoTotal;
    this.dataEntrega = new Date(dados.dataEntrega.getTime());
    this.tipoCaptacao = dados.tipoCaptacao;
    this.localizacaoFiltragens = dados.localizacaoFiltragens.clonar();
    this.periodoFiltragens = dados.periodoFiltragens.clonar();
    this.papeisObrigatorios = dados.papeisObrigatorios.map((papel) => papel.clonar());
    this.estrategiaPreferida = dados.estrategiaPreferida;
    this.metaProducao = { ...dados.metaProducao };
  }

  abstract clonar(ajustes?: Partial<DadosProjeto>): Projeto;

  requerPapel(papel: Papel): boolean {
    return this.papeisObrigatorios.some((requerido) => requerido.papel === papel);
  }

  pesoDoPapel(papel: Papel): number {
    return this.papeisObrigatorios.find((requerido) => requerido.papel === papel)?.peso ?? 0;
  }

  pesoTotalPapeis(): number {
    return this.papeisObrigatorios.reduce((total, papel) => total + papel.peso, 0);
  }

  aceitarVisitante(visitante: VisitanteProjeto): void {
    visitante.visitarProjeto(this);
    for (const papel of this.papeisObrigatorios) {
      papel.aceitarVisitante(visitante);
    }
  }

  protected clonarBase(ajustes?: Partial<DadosProjeto>): DadosProjeto {
    const localizacao = ajustes?.localizacaoFiltragens ?? this.localizacaoFiltragens;
    const periodo = ajustes?.periodoFiltragens ?? this.periodoFiltragens;
    const papeis = ajustes?.papeisObrigatorios ?? this.papeisObrigatorios;
    return {
      id: ajustes?.id ?? this.id,
      titulo: ajustes?.titulo ?? this.titulo,
      genero: ajustes?.genero ?? this.genero,
      duracaoEstimadaMinutos: ajustes?.duracaoEstimadaMinutos ?? this.duracaoEstimadaMinutos,
      orcamentoTotal: ajustes?.orcamentoTotal ?? this.orcamentoTotal,
      dataEntrega: ajustes?.dataEntrega ? new Date(ajustes.dataEntrega.getTime()) : new Date(this.dataEntrega.getTime()),
      tipoCaptacao: this.tipoCaptacao,
      localizacaoFiltragens: localizacao.clonar(),
      periodoFiltragens: periodo.clonar(),
      papeisObrigatorios: papeis.map((papel) => papel.clonar()),
      estrategiaPreferida: ajustes?.estrategiaPreferida ?? this.estrategiaPreferida,
      metaProducao: { ...(ajustes?.metaProducao ?? this.metaProducao) },
      margemReservaImprevistos: ajustes?.margemReservaImprevistos,
      taxaQuadrosPorSegundo: ajustes?.taxaQuadrosPorSegundo,
      estiloAnimacao: ajustes?.estiloAnimacao,
      clienteAnunciante: ajustes?.clienteAnunciante,
      prazoVeiculacaoDias: ajustes?.prazoVeiculacaoDias,
      complexidadeCenografia: ajustes?.complexidadeCenografia,
    };
  }
}
