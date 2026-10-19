import { Papel } from '../../domain/enums/papel.js';
import { ProjetoDocumentario } from '../../domain/entities/projetos/projeto-documentario.js';
import { ProjetoAnimacao } from '../../domain/entities/projetos/projeto-animacao.js';
import type { VisitanteProjeto } from '../../domain/visitors/visitante-projeto.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { MembroEquipe } from '../../domain/entities/membro-equipe.js';

export type SeveridadeViolacao = 'ERRO' | 'AVISO';

export interface Violacao {
  readonly codigo: string;
  readonly mensagem: string;
  readonly severidade: SeveridadeViolacao;
}

const PRAZO_MAXIMO_PUBLICITARIO = 45;

export abstract class ValidadorEspecializado implements VisitanteProjeto {
  protected violacoes: Violacao[] = [];

  validarProjeto(projeto: Projeto): Violacao[] {
    this.violacoes = [];
    projeto.aceitarVisitante(this);
    this.validarEspecificoProjeto(projeto);
    return [...this.violacoes];
  }

  validarEquipe(equipe: Equipe, projeto: Projeto): Violacao[] {
    this.violacoes = [];
    equipe.aceitarVisitante(this);
    this.validarEspecificoEquipe(equipe, projeto);
    return [...this.violacoes];
  }

  visitarProjeto(projeto: Projeto): void {
    if (projeto.orcamentoTotal <= 0) {
      this.adicionar('ORCAMENTO_INVALIDO', 'O orcamento do projeto deve ser maior que zero.', 'ERRO');
    }
    if (projeto.papeisObrigatorios.length === 0) {
      this.adicionar('PAPEIS_VAZIOS', 'O projeto precisa de ao menos um papel requerido.', 'ERRO');
    }
    if (projeto.pesoTotalPapeis() <= 0) {
      this.adicionar('PESOS_INVALIDOS', 'Os papeis requeridos precisam ter peso positivo.', 'AVISO');
    }
  }

  visitarPapelRequerido(_papel: PapelRequerido): void {}

  visitarEquipe(equipe: Equipe): void {
    if (equipe.membros.length === 0) {
      this.adicionar('EQUIPE_VAZIA', 'Nenhum membro foi escalado para a equipe.', 'ERRO');
    }
  }

  visitarMembroEquipe(_membro: MembroEquipe): void {}

  protected adicionar(
    codigo: string,
    mensagem: string,
    severidade: SeveridadeViolacao,
  ): void {
    this.violacoes.push({ codigo, mensagem, severidade });
  }

  protected exigirPapel(projeto: Projeto, papel: Papel): void {
    if (!projeto.requerPapel(papel)) {
      this.adicionar(
        'PAPEL_OBRIGATORIO_AUSENTE',
        `O papel ${papel} e obrigatorio para este tipo de projeto.`,
        'ERRO',
      );
    }
  }

  protected validarEspecificoProjeto(_projeto: Projeto): void {}

  protected validarEspecificoEquipe(_equipe: Equipe, _projeto: Projeto): void {}
}

export class ValidadorDocumentario extends ValidadorEspecializado {
  protected validarEspecificoProjeto(projeto: Projeto): void {
    this.exigirPapel(projeto, Papel.DIRETOR_FOTOGRAFIA);
    if (projeto instanceof ProjetoDocumentario && projeto.margemReservaImprevistos < 0.15) {
      this.adicionar(
        'MARGEM_INSUFICIENTE',
        'Documentarios exigem margem de reserva minima de 15%.',
        'ERRO',
      );
    }
  }

  protected validarEspecificoEquipe(equipe: Equipe, projeto: Projeto): void {
    if (projeto instanceof ProjetoDocumentario) {
      const reserva = projeto.valorReservaImprevistos();
      if (equipe.custoTotal() > projeto.orcamentoTotal - reserva) {
        this.adicionar(
          'RESERVA_COMPROMETIDA',
          'O custo da equipe compromete a reserva de imprevistos.',
          'AVISO',
        );
      }
    }
  }
}

export class ValidadorAnimacao extends ValidadorEspecializado {
  protected validarEspecificoProjeto(projeto: Projeto): void {
    this.exigirPapel(projeto, Papel.VFX);
    if (!projeto.localizacaoFiltragens.ehRemoto()) {
      this.adicionar(
        'LOCALIZACAO_NAO_REMOTA',
        'Projetos de animacao exigem localizacao REMOTO.',
        'ERRO',
      );
    }
    if (projeto instanceof ProjetoAnimacao && projeto.taxaQuadrosPorSegundo < 24) {
      this.adicionar(
        'FPS_INSUFICIENTE',
        'Animacoes exigem taxa minima de 24 frames por segundo.',
        'ERRO',
      );
    }
  }
}

export class ValidadorPublicitario extends ValidadorEspecializado {
  protected validarEspecificoProjeto(projeto: Projeto): void {
    this.exigirPapel(projeto, Papel.DIRETOR);
    this.exigirPapel(projeto, Papel.DIRETOR_FOTOGRAFIA);
    if (projeto.periodoFiltragens.duracaoDias() > PRAZO_MAXIMO_PUBLICITARIO) {
      this.adicionar(
        'PRAZO_EXCEDIDO',
        `Captacoes publicitarias nao podem exceder ${PRAZO_MAXIMO_PUBLICITARIO} dias.`,
        'ERRO',
      );
    }
  }
}

export class ValidadorFiccao extends ValidadorEspecializado {
  protected validarEspecificoProjeto(projeto: Projeto): void {
    this.exigirPapel(projeto, Papel.ROTEIRISTA);
  }
}

export class ValidadorPadrao extends ValidadorEspecializado {}
