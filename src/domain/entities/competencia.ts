export class Competencia {
  constructor(
    readonly nome: string,
    readonly nivel: number,
  ) {
    if (nivel < 0 || nivel > 1) {
      throw new Error('Nivel de competencia deve estar entre 0.0 e 1.0');
    }
  }
}
