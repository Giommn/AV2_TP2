import type { Projeto } from '../entities/projeto.js';
import type { PapelRequerido } from '../entities/papel-requerido.js';
import type { Equipe } from '../entities/equipe.js';
import type { MembroEquipe } from '../entities/membro-equipe.js';

export interface VisitanteProjeto {
  visitarProjeto(projeto: Projeto): void;
  visitarPapelRequerido(papel: PapelRequerido): void;
  visitarEquipe(equipe: Equipe): void;
  visitarMembroEquipe(membro: MembroEquipe): void;
}
