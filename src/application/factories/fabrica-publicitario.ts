import { RegistroPrototipos } from '../../domain/entities/projetos/registro-prototipos.js';
import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import { EstrategiaOrcamentoReduzido } from '../recommendation/strategies/orcamento-reduzido.js';
import { PARAMETROS_PUBLICITARIO } from '../recommendation/parametros-recomendacao.js';
import { ValidadorPublicitario } from '../visitors/validadores-especializados.js';
import { NotificadorPublicitario } from '../notifiers/notificadores-concretos.js';
import type { FabricaProjeto } from './fabrica-projeto.js';
import type { Projeto, DadosProjeto } from '../../domain/entities/projeto.js';
import type { ValidadorEspecializado } from '../visitors/validadores-especializados.js';
import type { NotificadorProjeto } from '../notifiers/notificador-projeto.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export class FabricaPublicitario implements FabricaProjeto {
  readonly tipoCaptacao = TipoCaptacao.PUBLICITARIO;

  constructor(
    private readonly registroPrototipos: RegistroPrototipos,
    private readonly barramento: BarramentoEventos,
  ) {}

  criarProjeto(dados?: Partial<DadosProjeto>): Projeto {
    return this.registroPrototipos.obter(this.tipoCaptacao).clonar(dados);
  }

  criarValidador(): ValidadorEspecializado {
    return new ValidadorPublicitario();
  }

  criarRecomendador(): MotorRecomendacao {
    return new MotorRecomendacao(new EstrategiaOrcamentoReduzido(), PARAMETROS_PUBLICITARIO);
  }

  criarNotificador(): NotificadorProjeto {
    return new NotificadorPublicitario(this.barramento);
  }

  normalizarProjeto(projeto: Projeto): Projeto {
    return projeto.clonar({});
  }
}
