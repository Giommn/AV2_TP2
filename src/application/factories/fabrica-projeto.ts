import type { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';
import type { Projeto, DadosProjeto } from '../../domain/entities/projeto.js';
import type { ValidadorEspecializado } from '../visitors/validadores-especializados.js';
import type { MotorRecomendacao } from '../recommendation/motor-recomendacao.js';
import type { NotificadorProjeto } from '../notifiers/notificador-projeto.js';

export interface FabricaProjeto {
  readonly tipoCaptacao: TipoCaptacao;
  criarProjeto(dados?: Partial<DadosProjeto>): Projeto;
  criarValidador(): ValidadorEspecializado;
  criarRecomendador(): MotorRecomendacao;
  criarNotificador(): NotificadorProjeto;
  normalizarProjeto(projeto: Projeto): Projeto;
}
