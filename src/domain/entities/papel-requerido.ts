import { VetorCompetencias } from '../value-objects/vetor-competencias.js';
import type { Papel } from '../enums/papel.js';
import type { VisitanteProjeto } from '../visitors/visitante-projeto.js';

export interface AjustesPapelRequerido {
  papel?: Papel;
  peso?: number;
  competenciasDesejadas?: VetorCompetencias;
}

export class PapelRequerido {
  constructor(
    readonly papel: Papel,
    readonly peso: number,
    readonly competenciasDesejadas: VetorCompetencias,
  ) {}

  clonar(ajustes?: AjustesPapelRequerido): PapelRequerido {
    return new PapelRequerido(
      ajustes?.papel ?? this.papel,
      ajustes?.peso ?? this.peso,
      ajustes?.competenciasDesejadas ?? VetorCompetencias.criar(this.competenciasDesejadas.paraObjeto()),
    );
  }

  aceitarVisitante(visitante: VisitanteProjeto): void {
    visitante.visitarPapelRequerido(this);
  }
}
