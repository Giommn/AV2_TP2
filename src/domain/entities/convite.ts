import type { Papel } from '../enums/papel.js';
import { StatusConvite } from '../enums/status-convite.js';

export class Convite {
  id: string;
  equipeId: string;
  profissionalId: string;
  papel: Papel;
  cacheOferecido: number;
  status: StatusConvite;
  dataCriacao: Date;
  dataResposta?: Date;

  constructor(params: {
    id: string;
    equipeId: string;
    profissionalId: string;
    papel: Papel;
    cacheOferecido: number;
    status: StatusConvite;
    dataCriacao?: Date;
    dataResposta?: Date;
  }) {
    this.id = params.id;
    this.equipeId = params.equipeId;
    this.profissionalId = params.profissionalId;
    this.papel = params.papel;
    this.cacheOferecido = params.cacheOferecido;
    this.status = params.status;
    this.dataCriacao = params.dataCriacao ?? new Date();
    this.dataResposta = params.dataResposta;
  }

  aceitar(): void {
    if (this.status === StatusConvite.PENDENTE) {
      this.status = StatusConvite.ACEITO;
      this.dataResposta = new Date();
    }
  }

  recusar(): void {
    if (this.status === StatusConvite.PENDENTE) {
      this.status = StatusConvite.RECUSADO;
      this.dataResposta = new Date();
    }
  }

  estaPendente(): boolean {
    return this.status === StatusConvite.PENDENTE;
  }
}
