import { describe, expect, it } from 'vitest';
import { construirAplicacao, type DependenciasAplicacao } from '../../src/composition/container.js';
import { Projeto, type DadosProjeto } from '../../src/domain/entities/projeto.js';
import { PapelRequerido } from '../../src/domain/entities/papel-requerido.js';
import { VetorCompetencias } from '../../src/domain/value-objects/vetor-competencias.js';
import { Localizacao } from '../../src/domain/value-objects/localizacao.js';
import { IntervaloDatas } from '../../src/domain/value-objects/intervalo-datas.js';
import { Papel } from '../../src/domain/enums/papel.js';
import { TipoCaptacao } from '../../src/domain/enums/tipo-captacao.js';
import { NomeEstrategia } from '../../src/domain/enums/nome-estrategia.js';
import { ErroNegocio } from '../../src/application/erros.js';
import { MotorRecomendacao } from '../../src/application/recommendation/motor-recomendacao.js';
import { criarEstrategia } from '../../src/application/recommendation/strategies/fabrica-estrategias.js';
import { ValidadorPadrao } from '../../src/application/visitors/validadores-especializados.js';
import { NotificadorGenerico } from '../../src/application/notifiers/notificador-projeto.js';
import type { FabricaProjeto } from '../../src/application/factories/fabrica-projeto.js';
import type { BarramentoEventos } from '../../src/domain/ports/barramento-eventos.js';

const TIPO_REALIDADE_VIRTUAL = 'REALIDADE_VIRTUAL' as TipoCaptacao;

class ProjetoRealidadeVirtual extends Projeto {
  readonly grauImersao: number;

  constructor(dados: DadosProjeto & { grauImersao: number }) {
    super(dados);
    this.grauImersao = dados.grauImersao;
  }

  clonar(ajustes?: Partial<DadosProjeto>): ProjetoRealidadeVirtual {
    const base = this.clonarBase(ajustes);
    return new ProjetoRealidadeVirtual({ ...base, grauImersao: this.grauImersao });
  }
}

class FabricaRealidadeVirtual implements FabricaProjeto {
  readonly tipoCaptacao: TipoCaptacao = TIPO_REALIDADE_VIRTUAL;

  constructor(
    private readonly registroPrototipos: DependenciasAplicacao['registroPrototipos'],
    private readonly barramento: BarramentoEventos,
  ) {}

  criarProjeto(dados?: Partial<DadosProjeto>): Projeto {
    return this.registroPrototipos.obter(this.tipoCaptacao).clonar(dados);
  }

  criarValidador(): ValidadorPadrao {
    return new ValidadorPadrao();
  }

  criarRecomendador(): MotorRecomendacao {
    return new MotorRecomendacao(criarEstrategia(NomeEstrategia.SIMILARIDADE_COSSENO));
  }

  criarNotificador(): NotificadorGenerico {
    return new NotificadorGenerico(this.barramento, this.tipoCaptacao);
  }

  normalizarProjeto(projeto: Projeto): Projeto {
    return projeto.clonar({});
  }
}

function registrarRealidadeVirtual(app: DependenciasAplicacao): void {
  const prototipo = new ProjetoRealidadeVirtual({
    id: 'prototipo-realidade-virtual',
    titulo: 'Prototipo Realidade Virtual',
    genero: 'Imersivo',
    duracaoEstimadaMinutos: 20,
    orcamentoTotal: 300000,
    dataEntrega: new Date('2026-10-01'),
    tipoCaptacao: TIPO_REALIDADE_VIRTUAL,
    localizacaoFiltragens: Localizacao.remoto(),
    periodoFiltragens: new IntervaloDatas(new Date('2026-02-01'), new Date('2026-08-01')),
    papeisObrigatorios: [
      new PapelRequerido(
        Papel.DIRETOR,
        5,
        VetorCompetencias.criar({ direcao: 0.9, narrativa: 0.9, lideranca: 0.9 }),
      ),
      new PapelRequerido(
        Papel.VFX,
        5,
        VetorCompetencias.criar({
          modelagem_3d: 0.9,
          renderizacao: 0.9,
          composicao: 0.9,
          vfx: 0.9,
        }),
      ),
    ],
    metaProducao: { formato: 'experiencia-imersiva' },
    grauImersao: 0.9,
  });
  app.registroPrototipos.registrar(prototipo);
  app.registroFabricas.registrar(
    new FabricaRealidadeVirtual(app.registroPrototipos, app.barramento),
  );
}

describe('Abstract Factory + Orquestrador', () => {
  it('produz metricas de renderizacao e forca localizacao remota em animacao', async () => {
    const app = construirAplicacao();
    const resultado = await app.servicoRecomendacao.executar({
      tipoCaptacao: TipoCaptacao.ANIMACAO,
      orcamentoTotal: 400000,
    });

    expect(resultado.projeto.localizacaoFiltragens.ehRemoto()).toBe(true);
    expect(resultado.equipe.membros.length).toBeGreaterThan(0);

    const metricas = resultado.relatorioEspecializado.metricas;
    expect(metricas.totalFramesParaRenderizar).toBeGreaterThan(0);
    expect(metricas.horasEstimadasRenderizacao).toBeGreaterThan(0);
    expect(resultado.relatorioEspecializado.tipo).toBe(TipoCaptacao.ANIMACAO);
  });

  it('valida prazos curtos e calcula custo diario em projeto publicitario', async () => {
    const app = construirAplicacao();
    const resultado = await app.servicoRecomendacao.executar({
      tipoCaptacao: TipoCaptacao.PUBLICITARIO,
      orcamentoTotal: 120000,
    });

    expect(resultado.relatorioEspecializado.tipo).toBe(TipoCaptacao.PUBLICITARIO);
    expect(resultado.relatorioEspecializado.metricas.custoDiarioVeiculacao).toBeGreaterThan(0);

    await expect(
      app.servicoRecomendacao.executar({
        tipoCaptacao: TipoCaptacao.PUBLICITARIO,
        orcamentoTotal: 120000,
        periodoFiltragens: new IntervaloDatas(
          new Date('2026-01-01'),
          new Date('2026-06-01'),
        ),
      }),
    ).rejects.toBeInstanceOf(ErroNegocio);
  });

  it('comprova extensibilidade (OCP) registrando nova fabrica sem alterar o orquestrador', async () => {
    const app = construirAplicacao();
    registrarRealidadeVirtual(app);

    const resultado = await app.servicoRecomendacao.executar({
      tipoCaptacao: TIPO_REALIDADE_VIRTUAL,
      orcamentoTotal: 300000,
    });

    expect(resultado.equipe.membros.length).toBe(2);
    expect(resultado.projeto.tipoCaptacao).toBe(TIPO_REALIDADE_VIRTUAL);
    expect(resultado.relatorioEspecializado.tipo).toBe(TIPO_REALIDADE_VIRTUAL);
    expect(resultado.recomendacoes).toHaveLength(2);
  });
});
