# CineBridge — cinebridge-recomendacao

Microsservico de composicao automatizada e recomendacao de equipes tecnicas audiovisuais.

## Requisitos

- Node.js >= 20.0.0 (ESM nativo)
- npm >= 10

## Instalacao

```bash
npm install
```

## Scripts

```bash
npm run dev        # executa o servidor com tsx
npm run build      # compila TypeScript para dist/
npm start          # executa a versao compilada
npm test           # testes unitarios e de integracao (Vitest)
npm run typecheck  # checagem estrita de tipos
```

## Arquitetura

O projeto integra 7 padroes GoF:

- `Prototype`: `Projeto` abstrata com `clonar()` e deep copy; `RegistroPrototipos`.
- `Abstract Factory` + `Factory Method`: `FabricaProjeto` e fabricas por nicho.
- `Strategy`: `EstrategiaRecomendacao` e `MotorRecomendacao`.
- `Observer`: `BarramentoEventosLocal` e observadores concretos.
- `Visitor`: `VisitanteProjeto`, validadores, calculador e gerador de relatorio.
- `Template Method` implicito nos notificadores especializados.

O registro polimorfico de fabricas (`RegistroFabricasProjeto`) elimina `switch/case`
na selecao por tipo, e o `OrquestradorEquipe` opera sem condicionais de tipo (OCP).

## Endpoints

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/saude` | Health check |
| GET | `/prototipos` | Lista os modelos suportados para clonagem |
| POST | `/recomendacoes/equipe` | Cria projeto e compoe a equipe (201) |
| POST | `/convites/:conviteId/resposta` | Responde convite (`{"aceito": true}`) |

Erros de negocio retornam `422`; entidades ausentes retornam `404`.

### Exemplo

```bash
curl -X POST http://localhost:3000/recomendacoes/equipe \
  -H "Content-Type: application/json" \
  -d '{"tipoCaptacao":"ANIMACAO","orcamentoTotal":400000}'
```

## Portabilidade

Funciona em Windows 10+ (PowerShell/CMD) e Linux Ubuntu 24.04+ (Node.js ESM),
sem scripts especificos de sistema operacional.
