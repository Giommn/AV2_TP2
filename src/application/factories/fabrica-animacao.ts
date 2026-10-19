import { RegistroPrototipos } from '../../domain/entities/projetos/registro-prototipos.js';
import { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import { Localizacao } from '../../domain/value-objects/localizacao.js';
import { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import { EstrategiaSimilaridadeCosseno } from '../recommendation/strategies/similaridade-cosseno.js';
import { PARAMETROS_ANIMACAO } from '../recommendation/parametros-recomendacao.js';
import { ValidadorAnimacao } from '../visitors/validadores-especializados.js';
import { NotificadorAnimacao } from '../notifiers/notificadores-concretos.js';
import type { FabricaProjeto } from './fabrica-projeto.js';
import type { Projeto, DadosProjeto } from '../../domain/entities/projeto.js';
import type { ValidadorEspecializado } from '../visitors/validadores-especializados.js';
import type { NotificadorProjeto } from '../notifiers/notificador-projeto.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export class FabricaAnimacao implements FabricaProjeto {
  readonly tipoCaptacao = TipoCaptacao.ANIMACAO;

  constructor(
    private readonly registroPrototipos: RegistroPrototipos,
    private readonly barramento: BarramentoEventos,
  ) {}

  criarProjeto(dados?: Partial<DadosProjeto>): Projeto {
    return this.registroPrototipos.obter(this.tipoCaptacao).clonar(dados);
  }

  criarValidador(): ValidadorEspecializado {
    return new ValidadorAnimacao();
  }

  criarRecomendador(): MotorRecomendacao {
    return new MotorRecomendacao(new EstrategiaSimilaridadeCosseno(), PARAMETROS_ANIMACAO);
  }

  criarNotificador(): NotificadorProjeto {
    return new NotificadorAnimacao(this.barramento);
  }

  normalizarProjeto(projeto: Projeto): Projeto {
    return projeto.clonar({ localizacaoFiltragens: Localizacao.remoto() });
  }
}
