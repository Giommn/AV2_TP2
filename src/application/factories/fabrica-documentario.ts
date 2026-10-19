import { RegistroPrototipos } from '../../domain/entities/projetos/registro-prototipos.js';
import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { IntervaloDatas } from '../../domain/value-objects/intervalo-datas.js';
import { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import { EstrategiaSimilaridadeCosseno } from '../recommendation/strategies/similaridade-cosseno.js';
import { PARAMETROS_DOCUMENTARIO } from '../recommendation/parametros-recomendacao.js';
import { ValidadorDocumentario } from '../visitors/validadores-especializados.js';
import { NotificadorDocumentario } from '../notifiers/notificadores-concretos.js';
import type { FabricaProjeto } from './fabrica-projeto.js';
import type { Projeto, DadosProjeto } from '../../domain/entities/projeto.js';
import type { ValidadorEspecializado } from '../visitors/validadores-especializados.js';
import type { NotificadorProjeto } from '../notifiers/notificador-projeto.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

const DIAS_EXTENSAO_DOCUMENTARIO = 30;

export class FabricaDocumentario implements FabricaProjeto {
  readonly tipoCaptacao = TipoCaptacao.DOCUMENTARIO;

  constructor(
    private readonly registroPrototipos: RegistroPrototipos,
    private readonly barramento: BarramentoEventos,
  ) {}

  criarProjeto(dados?: Partial<DadosProjeto>): Projeto {
    return this.registroPrototipos.obter(this.tipoCaptacao).clonar(dados);
  }

  criarValidador(): ValidadorEspecializado {
    return new ValidadorDocumentario();
  }

  criarRecomendador(): MotorRecomendacao {
    return new MotorRecomendacao(
      new EstrategiaSimilaridadeCosseno(),
      PARAMETROS_DOCUMENTARIO,
    );
  }

  criarNotificador(): NotificadorProjeto {
    return new NotificadorDocumentario(this.barramento);
  }

  normalizarProjeto(projeto: Projeto): Projeto {
    const periodo = new IntervaloDatas(
      projeto.periodoFiltragens.inicio,
      new Date(projeto.periodoFiltragens.fim.getTime() + DIAS_EXTENSAO_DOCUMENTARIO * 86400000),
    );
    return projeto.clonar({ periodoFiltragens: periodo });
  }
}
