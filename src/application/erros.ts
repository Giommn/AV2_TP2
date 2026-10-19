export class ErroNegocio extends Error {
  readonly codigo: string;

  constructor(mensagem: string, codigo = 'ERRO_NEGOCIO') {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.codigo = codigo;
  }
}

export class ErroNaoEncontrado extends Error {
  readonly codigo: string;

  constructor(mensagem: string, codigo = 'NAO_ENCONTRADO') {
    super(mensagem);
    this.name = 'ErroNaoEncontrado';
    this.codigo = codigo;
  }
}
