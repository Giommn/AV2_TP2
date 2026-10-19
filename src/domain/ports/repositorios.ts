import type { Profissional } from '../entities/profissional.js';
import type { Projeto } from '../entities/projeto.js';
import type { Equipe } from '../entities/equipe.js';
import type { Convite } from '../entities/convite.js';
import type { Recomendacao } from '../entities/recomendacao.js';
import type { Papel } from '../enums/papel.js';

export interface RepositorioProfissionais {
  listar(): Promise<Profissional[]>;
  buscarPorId(id: string): Promise<Profissional | undefined>;
  buscarPorPapel(papel: Papel): Promise<Profissional[]>;
  salvar(profissional: Profissional): Promise<void>;
}

export interface RepositorioProjetos {
  salvar(projeto: Projeto): Promise<void>;
  buscarPorId(id: string): Promise<Projeto | undefined>;
  listar(): Promise<Projeto[]>;
}

export interface RepositorioEquipes {
  salvar(equipe: Equipe): Promise<void>;
  buscarPorId(id: string): Promise<Equipe | undefined>;
  listar(): Promise<Equipe[]>;
}

export interface RepositorioConvites {
  salvar(convite: Convite): Promise<void>;
  buscarPorId(id: string): Promise<Convite | undefined>;
  listarPorEquipe(equipeId: string): Promise<Convite[]>;
  listar(): Promise<Convite[]>;
}

export interface RepositorioRecomendacoes {
  salvar(recomendacao: Recomendacao): Promise<void>;
  listarPorProjeto(projetoId: string): Promise<Recomendacao[]>;
}
