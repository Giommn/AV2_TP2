import { randomUUID } from 'node:crypto';
import { Convite } from '../../domain/entities/convite.js';
import { StatusConvite } from '../../domain/enums/status-convite.js';
import { ConviteAceitoEvento, ConviteCriadoEvento, ConviteRecusadoEvento } from '../../domain/events/eventos.js';
import { ErroNaoEncontrado, ErroNegocio } from '../erros.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { RepositorioConvites } from '../../domain/ports/repositorios.js';
import type { BarramentoEventos } from '../../domain/ports/barramento-eventos.js';

export class ServicoConvite {
  constructor(
    private readonly repositorioConvites: RepositorioConvites,
    private readonly barramento: BarramentoEventos,
  ) {}

  async gerarConvites(equipe: Equipe, _projeto: Projeto): Promise<Convite[]> {
    const convites: Convite[] = [];
    for (const membro of equipe.membros) {
      const convite = new Convite({
        id: randomUUID(),
        equipeId: equipe.id,
        profissionalId: membro.profissionalId,
        papel: membro.papel,
        cacheOferecido: membro.cacheNegociado,
        status: StatusConvite.PENDENTE,
      });
      await this.repositorioConvites.salvar(convite);
      await this.barramento.publicar(
        new ConviteCriadoEvento(
          convite.id,
          convite.equipeId,
          convite.profissionalId,
          convite.papel,
          convite.cacheOferecido,
        ),
      );
      convites.push(convite);
    }
    return convites;
  }

  async responder(conviteId: string, aceito: boolean): Promise<Convite> {
    const convite = await this.repositorioConvites.buscarPorId(conviteId);
    if (!convite) {
      throw new ErroNaoEncontrado(`Convite ${conviteId} nao encontrado`);
    }
    if (!convite.estaPendente()) {
      throw new ErroNegocio(`Convite ${conviteId} ja foi respondido`);
    }
    if (aceito) {
      convite.aceitar();
      await this.repositorioConvites.salvar(convite);
      await this.barramento.publicar(
        new ConviteAceitoEvento(convite.id, convite.equipeId, convite.profissionalId),
      );
    } else {
      convite.recusar();
      await this.repositorioConvites.salvar(convite);
      await this.barramento.publicar(
        new ConviteRecusadoEvento(convite.id, convite.equipeId, convite.profissionalId),
      );
    }
    return convite;
  }
}
