import type {
  RepositorioConvites,
  RepositorioEquipes,
  RepositorioProfissionais,
  RepositorioProjetos,
  RepositorioRecomendacoes,
} from '../../domain/ports/repositorios.js';
import type { Profissional } from '../../domain/entities/profissional.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { Convite } from '../../domain/entities/convite.js';
import type { Recomendacao } from '../../domain/entities/recomendacao.js';
import type { Papel } from '../../domain/enums/papel.js';

export class RepositorioProfissionaisMemoria implements RepositorioProfissionais {
  private readonly itens = new Map<string, Profissional>();

  constructor(profissionais: readonly Profissional[] = []) {
    for (const profissional of profissionais) {
      this.itens.set(profissional.id, profissional);
    }
  }

  async listar(): Promise<Profissional[]> {
    return [...this.itens.values()];
  }

  async buscarPorId(id: string): Promise<Profissional | undefined> {
    return this.itens.get(id);
  }

  async buscarPorPapel(papel: Papel): Promise<Profissional[]> {
    return [...this.itens.values()].filter((profissional) => profissional.atuaComo(papel));
  }

  async salvar(profissional: Profissional): Promise<void> {
    this.itens.set(profissional.id, profissional);
  }
}

export class RepositorioProjetosMemoria implements RepositorioProjetos {
  private readonly itens = new Map<string, Projeto>();

  async salvar(projeto: Projeto): Promise<void> {
    this.itens.set(projeto.id, projeto);
  }

  async buscarPorId(id: string): Promise<Projeto | undefined> {
    return this.itens.get(id);
  }

  async listar(): Promise<Projeto[]> {
    return [...this.itens.values()];
  }
}

export class RepositorioEquipesMemoria implements RepositorioEquipes {
  private readonly itens = new Map<string, Equipe>();

  async salvar(equipe: Equipe): Promise<void> {
    this.itens.set(equipe.id, equipe);
  }

  async buscarPorId(id: string): Promise<Equipe | undefined> {
    return this.itens.get(id);
  }

  async listar(): Promise<Equipe[]> {
    return [...this.itens.values()];
  }
}

export class RepositorioConvitesMemoria implements RepositorioConvites {
  private readonly itens = new Map<string, Convite>();

  async salvar(convite: Convite): Promise<void> {
    this.itens.set(convite.id, convite);
  }

  async buscarPorId(id: string): Promise<Convite | undefined> {
    return this.itens.get(id);
  }

  async listarPorEquipe(equipeId: string): Promise<Convite[]> {
    return [...this.itens.values()].filter((convite) => convite.equipeId === equipeId);
  }

  async listar(): Promise<Convite[]> {
    return [...this.itens.values()];
  }
}

export class RepositorioRecomendacoesMemoria implements RepositorioRecomendacoes {
  private readonly itens: Recomendacao[] = [];

  async salvar(recomendacao: Recomendacao): Promise<void> {
    this.itens.push(recomendacao);
  }

  async listarPorProjeto(projetoId: string): Promise<Recomendacao[]> {
    return this.itens.filter((recomendacao) => recomendacao.projetoId === projetoId);
  }
}
