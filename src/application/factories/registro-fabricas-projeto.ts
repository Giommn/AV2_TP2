import { ErroNaoEncontrado } from '../erros.js';
import type { FabricaProjeto } from './fabrica-projeto.js';
import type { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';

export class RegistroFabricasProjeto {
  private readonly fabricas = new Map<TipoCaptacao, FabricaProjeto>();

  registrar(fabrica: FabricaProjeto): void {
    this.fabricas.set(fabrica.tipoCaptacao, fabrica);
  }

  obter(tipo: TipoCaptacao): FabricaProjeto {
    const fabrica = this.fabricas.get(tipo);
    if (!fabrica) {
      throw new ErroNaoEncontrado(`Nenhuma fabrica registrada para o tipo ${tipo}`);
    }
    return fabrica;
  }

  possui(tipo: TipoCaptacao): boolean {
    return this.fabricas.has(tipo);
  }

  listarTipos(): TipoCaptacao[] {
    return [...this.fabricas.keys()];
  }
}
