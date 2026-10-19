import { MembroEquipe } from './membro-equipe.js';
import { StatusEquipe } from '../enums/status-equipe.js';
import type { VisitanteProjeto } from '../visitors/visitante-projeto.js';

export class Equipe {
  readonly id: string;
  readonly projetoId: string;
  status: StatusEquipe;
  private readonly listaMembros: MembroEquipe[];

  constructor(id: string, projetoId: string, status: StatusEquipe = StatusEquipe.EM_FORMACAO) {
    this.id = id;
    this.projetoId = projetoId;
    this.status = status;
    this.listaMembros = [];
  }

  get membros(): readonly MembroEquipe[] {
    return [...this.listaMembros];
  }

  adicionarMembro(membro: MembroEquipe): void {
    const existente = this.listaMembros.find(
      (m) => m.profissionalId === membro.profissionalId && m.papel === membro.papel,
    );
    if (existente) {
      return;
    }
    this.listaMembros.push(membro);
    this.atualizarStatus();
  }

  removerMembroPorProfissional(profissionalId: string): void {
    const indice = this.listaMembros.findIndex((m) => m.profissionalId === profissionalId);
    if (indice >= 0) {
      this.listaMembros.splice(indice, 1);
      this.atualizarStatus();
    }
  }

  custoTotal(): number {
    return this.listaMembros.reduce((total, membro) => total + membro.cacheNegociado, 0);
  }

  profissionaisConfirmados(): readonly MembroEquipe[] {
    return this.listaMembros.filter((membro) => membro.confirmado);
  }

  atualizarStatus(): StatusEquipe {
    const total = this.listaMembros.length;
    const confirmados = this.listaMembros.filter((membro) => membro.confirmado).length;
    if (total === 0 || confirmados === 0) {
      this.status = StatusEquipe.EM_FORMACAO;
    } else if (confirmados === total) {
      this.status = StatusEquipe.FORMADA;
    } else {
      this.status = StatusEquipe.FORMADA_PARCIAL;
    }
    return this.status;
  }

  aceitarVisitante(visitante: VisitanteProjeto): void {
    visitante.visitarEquipe(this);
    for (const membro of this.listaMembros) {
      membro.aceitarVisitante(visitante);
    }
  }
}
