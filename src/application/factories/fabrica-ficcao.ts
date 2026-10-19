import { RegistroPrototipos } from '../../domain/entities/projetos/registro-prototipos.js';
import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import { EstrategiaFiltragemColaborativa } from '../recommendation/strategies/filtragem-colaborativa.js';
import { PARAMETROS_FICCAO } from '../recommendation/parametros-recomendacao.js';
import { ValidadorFiccao } from '../visitors/validadores-especializados.js';
import { NotificadorFiccao } from '../notifiers/notificadores-concretos.js';
import type { FabricaProjeto } from './fabrica-projeto.js';
import type { Projeto, DadosProjeto } from '../../domain/entities/projeto.js';
import type { ValidadorEspecializado } from '../visitors/validadores-especializados.js';
import type { NotificadorProjeto } from '../notifiers/notificador-projeto.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export class FabricaFiccao implements FabricaProjeto {
  readonly tipoCaptacao = TipoCaptacao.FICCAO;

  constructor(
    private readonly registroPrototipos: RegistroPrototipos,
    private readonly barramento: BarramentoEventos,
  ) {}

  criarProjeto(dados?: Partial<DadosProjeto>): Projeto {
    return this.registroPrototipos.obter(this.tipoCaptacao).clonar(dados);
  }

  criarValidador(): ValidadorEspecializado {
    return new ValidadorFiccao();
  }

  criarRecomendador(): MotorRecomendacao {
    return new MotorRecomendacao(new EstrategiaFiltragemColaborativa(), PARAMETROS_FICCAO);
  }

  criarNotificador(): NotificadorProjeto {
    return new NotificadorFiccao(this.barramento);
  }

  normalizarProjeto(projeto: Projeto): Projeto {
    return projeto.clonar({});
  }
}
