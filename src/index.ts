import { construirAplicacao } from './composition/container.js';
import { construirServidor } from './interfaces/http/servidor.js';

async function iniciar(): Promise<void> {
  const app = construirAplicacao();
  const servidor = construirServidor(app);
  const porta = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await servidor.listen({ port: porta, host });
    servidor.log.info(`cinebridge-recomendacao escutando em ${host}:${porta}`);
  } catch (erro) {
    servidor.log.error(erro);
    process.exit(1);
  }
}

void iniciar();
