import { ConviteAceitoEvento, ConviteRecusadoEvento, EquipeFormadaEvento } from '../../domain/events/eventos.js';
import { StatusEquipe } from '../../domain/enums/status-equipe.js';
import type { EventoDominio, ObservadorEvento, BarramentoEventos } from '../../domain/ports/barramento-eventos.js';
import type { RepositorioEquipes } from '../../domain/ports/repositorios.js';

export class ObservadorAtualizacaoEquipe implements ObservadorEvento {
  readonly nome = 'ObservadorAtualizacaoEquipe';

  constructor(
    private readonly repositorioEquipes: RepositorioEquipes,
    private readonly barramento: BarramentoEventos,
  ) {}

  async tratar(evento: EventoDominio): Promise<void> {
    if (evento instanceof ConviteAceitoEvento) {
      await this.atualizar(evento.equipeId, evento.profissionalId, true);
      return;
    }
    if (evento instanceof ConviteRecusadoEvento) {
      await this.atualizar(evento.equipeId, evento.profissionalId, false);
    }
  }

  private async atualizar(
    equipeId: string,
    profissionalId: string,
    aceito: boolean,
  ): Promise<void> {
    const equipe = await this.repositorioEquipes.buscarPorId(equipeId);
    if (!equipe) {
      return;
    }
    if (aceito) {
      const membro = equipe.membros.find((m) => m.profissionalId === profissionalId);
      membro?.confirmar();
    } else {
      equipe.removerMembroPorProfissional(profissionalId);
    }
    equipe.atualizarStatus();
    await this.repositorioEquipes.salvar(equipe);
    if (equipe.status === StatusEquipe.FORMADA) {
      await this.barramento.publicar(new EquipeFormadaEvento(equipe.id, equipe.projetoId));
    }
  }
}
