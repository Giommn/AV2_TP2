import { NotificadorProjeto, type RelatorioEspecializado } from './notificador-projeto.js';
import { ProjetoDocumentario } from '../../domain/entities/projetos/projeto-documentario.js';
import { ProjetoAnimacao } from '../../domain/entities/projetos/projeto-animacao.js';
import { ProjetoPublicitario } from '../../domain/entities/projetos/projeto-publicitario.js';
import { ProjetoFiccao } from '../../domain/entities/projetos/projeto-ficcao.js';
import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { Papel } from '../../domain/enums/papel.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { Recomendacao } from '../../domain/entities/recomendacao.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

const FRAMES_POR_HORA_ARTISTA = 1500;

export class NotificadorDocumentario extends NotificadorProjeto {
  constructor(barramento: BarramentoEventos) {
    super(barramento);
  }

  gerarRelatorio(
    projeto: Projeto,
    equipe: Equipe,
    _recomendacoes: readonly Recomendacao[],
  ): RelatorioEspecializado {
    const margem = projeto instanceof ProjetoDocumentario ? projeto.margemReservaImprevistos : 0;
    const reserva = projeto.orcamentoTotal * margem;
    const custoEquipe = equipe.custoTotal();
    return {
      tipo: TipoCaptacao.DOCUMENTARIO,
      titulo: 'Relatorio de Producao Documental',
      metricas: {
        margemReservaPercentual: margem,
        valorReservaImprevistos: reserva,
        custoEquipe,
        margemPreservada: Math.max(0, reserva - custoEquipe),
      },
      observacoes: [
        'Avaliacao da preservacao da margem de seguranca financeira para imprevistos de campo.',
      ],
    };
  }
}

export class NotificadorAnimacao extends NotificadorProjeto {
  constructor(barramento: BarramentoEventos) {
    super(barramento);
  }

  gerarRelatorio(
    projeto: Projeto,
    equipe: Equipe,
    _recomendacoes: readonly Recomendacao[],
  ): RelatorioEspecializado {
    const fps = projeto instanceof ProjetoAnimacao ? projeto.taxaQuadrosPorSegundo : 24;
    const duracaoSegundos = projeto.duracaoEstimadaMinutos * 60;
    const totalFramesParaRenderizar = Math.round(duracaoSegundos * fps);
    const artistasVfx = Math.max(
      1,
      equipe.membros.filter((membro) => membro.papel === Papel.VFX).length,
    );
    const horasEstimadasRenderizacao =
      Math.round((totalFramesParaRenderizar / FRAMES_POR_HORA_ARTISTA / artistasVfx) * 100) / 100;
    return {
      tipo: TipoCaptacao.ANIMACAO,
      titulo: 'Relatorio de Eficiencia de Renderizacao',
      metricas: {
        taxaQuadrosPorSegundo: fps,
        totalFramesParaRenderizar,
        artistasVfx,
        horasEstimadasRenderizacao,
      },
      observacoes: [
        'Metricas de eficiencia de renderizacao calculadas a partir de fps e duracao.',
      ],
    };
  }
}

export class NotificadorPublicitario extends NotificadorProjeto {
  constructor(barramento: BarramentoEventos) {
    super(barramento);
  }

  gerarRelatorio(
    projeto: Projeto,
    equipe: Equipe,
    _recomendacoes: readonly Recomendacao[],
  ): RelatorioEspecializado {
    const prazo = projeto instanceof ProjetoPublicitario ? projeto.prazoVeiculacaoDias : 30;
    const cliente = projeto instanceof ProjetoPublicitario ? projeto.clienteAnunciante : 'Anunciante';
    const custoDiarioVeiculacao = projeto.orcamentoTotal / Math.max(1, prazo);
    const custoEquipe = equipe.custoTotal();
    return {
      tipo: TipoCaptacao.PUBLICITARIO,
      titulo: 'Relatorio de Impacto Comercial',
      metricas: {
        prazoVeiculacaoDias: prazo,
        custoDiarioVeiculacao,
        custoEquipe,
        indiceUrgenciaComercial: custoEquipe / Math.max(1, custoDiarioVeiculacao),
      },
      observacoes: [
        `Impacto de custo por diaria de veiculacao para o cliente ${cliente}.`,
        'Controle estrito de diarias comerciais e urgencia de entrega.',
      ],
    };
  }
}

export class NotificadorFiccao extends NotificadorProjeto {
  constructor(barramento: BarramentoEventos) {
    super(barramento);
  }

  gerarRelatorio(
    projeto: Projeto,
    equipe: Equipe,
    _recomendacoes: readonly Recomendacao[],
  ): RelatorioEspecializado {
    const densidade = projeto instanceof ProjetoFiccao ? projeto.densidadeDramatica() : 0;
    const atosEstimados = Math.max(3, Math.round(projeto.duracaoEstimadaMinutos / 30));
    return {
      tipo: TipoCaptacao.FICCAO,
      titulo: 'Relatorio de Estrutura Dramatica',
      metricas: {
        atosEstimados,
        densidadeDramatica: densidade,
        totalMembros: equipe.membros.length,
        custoEquipe: equipe.custoTotal(),
      },
      observacoes: [
        'Estrutura de atos e densidade dramatica estimadas para o projeto de ficcao.',
      ],
    };
  }
}
