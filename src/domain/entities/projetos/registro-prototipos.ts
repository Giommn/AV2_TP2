import { PapelRequerido } from '../papel-requerido.js';
import { VetorCompetencias } from '../../value-objects/vetor-competencias.js';
import { Localizacao } from '../../value-objects/localizacao.js';
import { IntervaloDatas } from '../../value-objects/intervalo-datas.js';
import { Papel } from '../../enums/papel.js';
import { TipoCaptacao } from '../../enums/tipo-captacao.js';
import { NomeEstrategia } from '../../enums/nome-estrategia.js';
import { EstiloAnimacao } from '../../enums/estilo-animacao.js';
import { competenciasDe } from '../../competencias-papel.js';
import { Projeto } from '../projeto.js';
import { ProjetoDocumentario } from './projeto-documentario.js';
import { ProjetoAnimacao } from './projeto-animacao.js';
import { ProjetoPublicitario } from './projeto-publicitario.js';
import { ProjetoFiccao } from './projeto-ficcao.js';
import { ErroNaoEncontrado } from '../../../application/erros.js';

export interface ResumoPrototipo {
  readonly tipoCaptacao: TipoCaptacao;
  readonly titulo: string;
  readonly totalPapeis: number;
}

function criarPapel(papel: Papel, peso: number): PapelRequerido {
  const competencias: Record<string, number> = {};
  for (const nome of competenciasDe(papel)) {
    competencias[nome] = 0.9;
  }
  return new PapelRequerido(papel, peso, VetorCompetencias.criar(competencias));
}

function intervalo(inicio: string, fim: string): IntervaloDatas {
  return new IntervaloDatas(new Date(inicio), new Date(fim));
}

export class RegistroPrototipos {
  private readonly prototipos: Map<TipoCaptacao, Projeto>;

  constructor() {
    this.prototipos = new Map<TipoCaptacao, Projeto>();
  }

  static criarPadrao(): RegistroPrototipos {
    const registro = new RegistroPrototipos();
    registro.registrar(
      new ProjetoDocumentario({
        id: 'prototipo-documentario',
        titulo: 'Prototipo Documentario',
        genero: 'Documentario',
        duracaoEstimadaMinutos: 90,
        orcamentoTotal: 250000,
        dataEntrega: new Date('2026-06-30'),
        tipoCaptacao: TipoCaptacao.DOCUMENTARIO,
        localizacaoFiltragens: new Localizacao('Sao Paulo', 'SP', 'Brasil'),
        periodoFiltragens: intervalo('2026-02-01', '2026-05-01'),
        papeisObrigatorios: [
          criarPapel(Papel.DIRETOR, 5),
          criarPapel(Papel.DIRETOR_FOTOGRAFIA, 5),
          criarPapel(Papel.SONOPLASTA, 3),
          criarPapel(Papel.EDITOR, 4),
        ],
        estrategiaPreferida: NomeEstrategia.SIMILARIDADE_COSSENO,
        metaProducao: { formato: 'longa-metragem', captacao: 'campo' },
        margemReservaImprevistos: 0.25,
      }),
    );
    registro.registrar(
      new ProjetoAnimacao({
        id: 'prototipo-animacao',
        titulo: 'Prototipo Animacao',
        genero: 'Animacao',
        duracaoEstimadaMinutos: 80,
        orcamentoTotal: 400000,
        dataEntrega: new Date('2026-09-30'),
        tipoCaptacao: TipoCaptacao.ANIMACAO,
        localizacaoFiltragens: Localizacao.remoto(),
        periodoFiltragens: intervalo('2026-02-01', '2026-08-01'),
        papeisObrigatorios: [
          criarPapel(Papel.DIRETOR, 5),
          criarPapel(Papel.VFX, 5),
          criarPapel(Papel.EDITOR, 4),
        ],
        estrategiaPreferida: NomeEstrategia.SIMILARIDADE_COSSENO,
        metaProducao: { formato: 'serie', pipeline: '3d' },
        taxaQuadrosPorSegundo: 24,
        estiloAnimacao: EstiloAnimacao.ANIMACAO_3D,
      }),
    );
    registro.registrar(
      new ProjetoPublicitario({
        id: 'prototipo-publicitario',
        titulo: 'Prototipo Publicitario',
        genero: 'Publicidade',
        duracaoEstimadaMinutos: 1,
        orcamentoTotal: 120000,
        dataEntrega: new Date('2026-04-05'),
        tipoCaptacao: TipoCaptacao.PUBLICITARIO,
        localizacaoFiltragens: new Localizacao('Rio de Janeiro', 'RJ', 'Brasil'),
        periodoFiltragens: intervalo('2026-03-01', '2026-03-20'),
        papeisObrigatorios: [
          criarPapel(Papel.DIRETOR, 5),
          criarPapel(Papel.DIRETOR_FOTOGRAFIA, 5),
          criarPapel(Papel.EDITOR, 3),
        ],
        estrategiaPreferida: NomeEstrategia.ORCAMENTO_REDUZIDO,
        metaProducao: { formato: 'filme-comercial' },
        clienteAnunciante: 'Agencia Criativa',
        prazoVeiculacaoDias: 30,
      }),
    );
    registro.registrar(
      new ProjetoFiccao({
        id: 'prototipo-ficcao',
        titulo: 'Prototipo Ficcao',
        genero: 'Drama',
        duracaoEstimadaMinutos: 110,
        orcamentoTotal: 600000,
        dataEntrega: new Date('2026-12-15'),
        tipoCaptacao: TipoCaptacao.FICCAO,
        localizacaoFiltragens: new Localizacao('Sao Paulo', 'SP', 'Brasil'),
        periodoFiltragens: intervalo('2026-02-01', '2026-06-01'),
        papeisObrigatorios: [
          criarPapel(Papel.DIRETOR, 5),
          criarPapel(Papel.ROTEIRISTA, 5),
          criarPapel(Papel.DIRETOR_FOTOGRAFIA, 4),
          criarPapel(Papel.SONOPLASTA, 3),
          criarPapel(Papel.EDITOR, 4),
        ],
        estrategiaPreferida: NomeEstrategia.FILTRAGEM_COLABORATIVA,
        metaProducao: { formato: 'longa-metragem', tom: 'drama' },
        complexidadeCenografia: 3,
      }),
    );
    return registro;
  }

  registrar(projeto: Projeto): void {
    this.prototipos.set(projeto.tipoCaptacao, projeto);
  }

  obter(tipo: TipoCaptacao): Projeto {
    const prototipo = this.prototipos.get(tipo);
    if (!prototipo) {
      throw new ErroNaoEncontrado(`Prototipo nao registrado para o tipo ${tipo}`);
    }
    return prototipo;
  }

  possui(tipo: TipoCaptacao): boolean {
    return this.prototipos.has(tipo);
  }

  listar(): ResumoPrototipo[] {
    return [...this.prototipos.values()].map((projeto) => ({
      tipoCaptacao: projeto.tipoCaptacao,
      titulo: projeto.titulo ?? projeto.genero,
      totalPapeis: projeto.papeisObrigatorios.length,
    }));
  }
}
