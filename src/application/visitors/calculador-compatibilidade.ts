import type { VisitanteProjeto } from '../../domain/visitors/visitante-projeto.js';
import type { Equipe } from '../../domain/entities/equipe.js';
import type { MembroEquipe } from '../../domain/entities/membro-equipe.js';
import type { PapelRequerido } from '../../domain/entities/papel-requerido.js';
import type { Projeto } from '../../domain/entities/projeto.js';
import type { Profissional } from '../../domain/entities/profissional.js';

export interface MetricasCompatibilidade {
  readonly indiceAderenciaMedia: number;
  readonly sinergiaTecnicaMedia: number;
  readonly totalMembros: number;
}

export class CalculadorCompatibilidadeEquipe implements VisitanteProjeto {
  private membrosVisitados: MembroEquipe[] = [];

  constructor(private readonly profissionaisPorId: ReadonlyMap<string, Profissional>) {}

  visitarProjeto(_projeto: Projeto): void {}

  visitarPapelRequerido(_papel: PapelRequerido): void {}

  visitarEquipe(_equipe: Equipe): void {
    this.membrosVisitados = [];
  }

  visitarMembroEquipe(membro: MembroEquipe): void {
    this.membrosVisitados.push(membro);
  }

  calcular(equipe: Equipe): MetricasCompatibilidade {
    equipe.aceitarVisitante(this);
    const membros = this.membrosVisitados;
    if (membros.length === 0) {
      return { indiceAderenciaMedia: 0, sinergiaTecnicaMedia: 0, totalMembros: 0 };
    }
    const indiceAderenciaMedia = this.calcularAderencia(membros);
    const sinergiaTecnicaMedia = this.calcularSinergia(membros);
    return {
      indiceAderenciaMedia: arredondar(indiceAderenciaMedia),
      sinergiaTecnicaMedia: arredondar(sinergiaTecnicaMedia),
      totalMembros: membros.length,
    };
  }

  private calcularAderencia(membros: readonly MembroEquipe[]): number {
    let soma = 0;
    let considerados = 0;
    for (const membro of membros) {
      const profissional = this.profissionaisPorId.get(membro.profissionalId);
      if (!profissional) {
        continue;
      }
      const competencia = profissional.competencias.media();
      const nota = profissional.notaNormalizada();
      soma += competencia * 0.5 + nota * 0.5;
      considerados += 1;
    }
    return considerados === 0 ? 0 : soma / considerados;
  }

  private calcularSinergia(membros: readonly MembroEquipe[]): number {
    if (membros.length < 2) {
      return 0;
    }
    let soma = 0;
    let pares = 0;
    for (let i = 0; i < membros.length; i += 1) {
      for (let j = i + 1; j < membros.length; j += 1) {
        const a = membros[i];
        const b = membros[j];
        if (!a || !b) {
          continue;
        }
        const profissionalA = this.profissionaisPorId.get(a.profissionalId);
        const profissionalB = this.profissionaisPorId.get(b.profissionalId);
        if (!profissionalA || !profissionalB) {
          continue;
        }
        const direta = profissionalA.afinidadeCom(profissionalB.id);
        const inversa = profissionalB.afinidadeCom(profissionalA.id);
        soma += (direta + inversa) / 2;
        pares += 1;
      }
    }
    return pares === 0 ? 0 : soma / pares;
  }
}

function arredondar(valor: number): number {
  return Math.round(valor * 10000) / 10000;
}
