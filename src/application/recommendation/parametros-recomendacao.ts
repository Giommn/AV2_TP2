export interface ParametrosRecomendacao {
  readonly pesoCompetencia: number;
  readonly pesoAvaliacao: number;
  readonly pesoCusto: number;
  readonly pesoLocalizacao: number;
  readonly pesoAfinidade: number;
}

export const PARAMETROS_PADRAO: ParametrosRecomendacao = {
  pesoCompetencia: 0.4,
  pesoAvaliacao: 0.25,
  pesoCusto: 0.2,
  pesoLocalizacao: 0.1,
  pesoAfinidade: 0.05,
};

export const PARAMETROS_DOCUMENTARIO: ParametrosRecomendacao = {
  pesoCompetencia: 0.3,
  pesoAvaliacao: 0.25,
  pesoCusto: 0.2,
  pesoLocalizacao: 0.2,
  pesoAfinidade: 0.05,
};

export const PARAMETROS_ANIMACAO: ParametrosRecomendacao = {
  pesoCompetencia: 0.75,
  pesoAvaliacao: 0.15,
  pesoCusto: 0.1,
  pesoLocalizacao: 0,
  pesoAfinidade: 0,
};

export const PARAMETROS_PUBLICITARIO: ParametrosRecomendacao = {
  pesoCompetencia: 0.2,
  pesoAvaliacao: 0.1,
  pesoCusto: 0.6,
  pesoLocalizacao: 0.05,
  pesoAfinidade: 0.05,
};

export const PARAMETROS_FICCAO: ParametrosRecomendacao = {
  pesoCompetencia: 0.25,
  pesoAvaliacao: 0.2,
  pesoCusto: 0.1,
  pesoLocalizacao: 0.1,
  pesoAfinidade: 0.35,
};
