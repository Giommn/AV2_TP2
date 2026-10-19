import { randomUUID } from 'node:crypto';
import { OrquestradorEquipe, type DependenciasOrquestrador, type ResultadoComposicao } from '../orchestration/orquestrador-composicao-equipe.js';
import type { RegistroFabricasProjeto } from '../factories/registro-fabricas-projeto.js';
import type { DadosProjeto } from '../../domain/entities/projeto.js';
import type { TipoCaptacao } from '../../domain/enums/tipo-captacao.js';

export type EntradaProjeto = Partial<DadosProjeto> & { tipoCaptacao: TipoCaptacao };

export class ServicoRecomendacao {
  constructor(
    private readonly registroFabricas: RegistroFabricasProjeto,
    private readonly deps: DependenciasOrquestrador,
  ) {}

  async executar(dados: EntradaProjeto): Promise<ResultadoComposicao> {
    const fabrica = this.registroFabricas.obter(dados.tipoCaptacao);
    const projeto = fabrica.criarProjeto({ ...dados, id: dados.id ?? randomUUID() });
    await this.deps.repositorioProjetos.salvar(projeto);
    const orquestrador = new OrquestradorEquipe(fabrica, this.deps);
    return orquestrador.compor(projeto);
  }
}
