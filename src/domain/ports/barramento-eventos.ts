export interface EventoDominio {
  readonly tipo: string;
  readonly ocorridoEm: Date;
}

export interface ObservadorEvento {
  readonly nome: string;
  tratar(evento: EventoDominio): void | Promise<void>;
}

export interface BarramentoEventos {
  publicar(evento: EventoDominio): Promise<void>;
  inscrever(observador: ObservadorEvento): void;
  inscreverPorTipo(tipo: string, observador: ObservadorEvento): void;
}
