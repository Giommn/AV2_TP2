export class Avaliacao {
  constructor(
    readonly profissionalId: string,
    readonly nota: number,
    readonly comentario: string | undefined,
    readonly registradaEm: Date,
  ) {
    if (nota < 0 || nota > 5) {
      throw new Error('Nota de avaliacao deve estar entre 0 e 5');
    }
  }
}
