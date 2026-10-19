const MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

export interface AjustesIntervalo {
  inicio?: Date;
  fim?: Date;
}

export class IntervaloDatas {
  readonly inicio: Date;
  readonly fim: Date;

  constructor(inicio: Date, fim: Date) {
    if (fim.getTime() < inicio.getTime()) {
      throw new Error('Intervalo de datas invalido: fim anterior ao inicio');
    }
    this.inicio = new Date(inicio.getTime());
    this.fim = new Date(fim.getTime());
  }

  duracaoDias(): number {
    return Math.round((this.fim.getTime() - this.inicio.getTime()) / MILISSEGUNDOS_POR_DIA);
  }

  contemIntervalo(outro: IntervaloDatas): boolean {
    return (
      this.inicio.getTime() <= outro.inicio.getTime() &&
      this.fim.getTime() >= outro.fim.getTime()
    );
  }

  sobrepoe(outro: IntervaloDatas): boolean {
    return (
      this.inicio.getTime() <= outro.fim.getTime() &&
      outro.inicio.getTime() <= this.fim.getTime()
    );
  }

  clonar(ajustes?: AjustesIntervalo): IntervaloDatas {
    return new IntervaloDatas(ajustes?.inicio ?? this.inicio, ajustes?.fim ?? this.fim);
  }

  comDeslocamento(dias: number): IntervaloDatas {
    const novoFim = new Date(this.fim.getTime() + dias * MILISSEGUNDOS_POR_DIA);
    return new IntervaloDatas(this.inicio, novoFim);
  }
}
