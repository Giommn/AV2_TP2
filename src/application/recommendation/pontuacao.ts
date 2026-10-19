export function normalizarCusto(custo: number, teto: number): number {
  if (teto <= 0) {
    return 0;
  }
  const razao = Math.min(1, Math.max(0, custo / teto));
  return 1 - razao;
}

export function mediaBayesiana(
  media: number,
  total: number,
  priorMedia = 3.5,
  pesoPrior = 5,
): number {
  const bayesiana = (media * total + priorMedia * pesoPrior) / (total + pesoPrior);
  return Math.max(0, Math.min(1, bayesiana / 5));
}

export function combinar(
  componentes: Readonly<Record<string, number>>,
  pesos: Readonly<Record<string, number>>,
): number {
  let soma = 0;
  for (const [chave, peso] of Object.entries(pesos)) {
    soma += peso * (componentes[chave] ?? 0);
  }
  return soma;
}
