export class VetorCompetencias {
  private readonly valores: ReadonlyMap<string, number>;
  private readonly norma: number;

  private constructor(valores: ReadonlyMap<string, number>, norma: number) {
    this.valores = valores;
    this.norma = norma;
  }

  static criar(registro: Record<string, number>): VetorCompetencias {
    const valores = new Map<string, number>();
    let somaQuadrados = 0;
    for (const [chave, valor] of Object.entries(registro)) {
      const ajustado = Math.max(0, Math.min(1, valor));
      valores.set(chave, ajustado);
      somaQuadrados += ajustado * ajustado;
    }
    return new VetorCompetencias(valores, Math.sqrt(somaQuadrados));
  }

  static vazio(): VetorCompetencias {
    return new VetorCompetencias(new Map<string, number>(), 0);
  }

  obter(competencia: string): number {
    return this.valores.get(competencia) ?? 0;
  }

  possui(competencia: string): boolean {
    return this.valores.has(competencia);
  }

  quantidade(): number {
    return this.valores.size;
  }

  entradas(): ReadonlyArray<readonly [string, number]> {
    return [...this.valores.entries()];
  }

  paraObjeto(): Record<string, number> {
    const objeto: Record<string, number> = {};
    for (const [chave, valor] of this.valores.entries()) {
      objeto[chave] = valor;
    }
    return objeto;
  }

  media(): number {
    if (this.valores.size === 0) {
      return 0;
    }
    let soma = 0;
    for (const valor of this.valores.values()) {
      soma += valor;
    }
    return soma / this.valores.size;
  }

  similaridadeCosseno(outro: VetorCompetencias): number {
    if (this.norma === 0 || outro.norma === 0) {
      return 0;
    }
    let produtoEscalar = 0;
    for (const [chave, valor] of this.valores.entries()) {
      const outroValor = outro.valores.get(chave);
      if (outroValor !== undefined) {
        produtoEscalar += valor * outroValor;
      }
    }
    return produtoEscalar / (this.norma * outro.norma);
  }
}
