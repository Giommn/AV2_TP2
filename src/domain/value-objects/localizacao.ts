const CIDADE_REMOTO = 'REMOTO';

export class Localizacao {
  constructor(
    readonly cidade: string,
    readonly uf: string,
    readonly pais: string,
  ) {}

  static remoto(): Localizacao {
    return new Localizacao(CIDADE_REMOTO, CIDADE_REMOTO, CIDADE_REMOTO);
  }

  ehRemoto(): boolean {
    return this.cidade === CIDADE_REMOTO || this.uf === CIDADE_REMOTO;
  }

  afinidadeCom(outra: Localizacao): number {
    if (this.ehRemoto() || outra.ehRemoto()) {
      return 1;
    }
    if (this.cidade === outra.cidade) {
      return 1;
    }
    if (this.uf === outra.uf) {
      return 0.6;
    }
    return 0;
  }

  clonar(): Localizacao {
    return new Localizacao(this.cidade, this.uf, this.pais);
  }
}
