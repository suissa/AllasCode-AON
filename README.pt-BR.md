# @purecore/aon (Português)

[![npm version](https://img.shields.io/npm/v/@purecore/aon.svg?style=flat-square)](https://www.npmjs.com/package/@purecore/aon)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)
[![RFC-0001: AONP v1.0.0](https://img.shields.io/badge/RFC--0001-AONP%20v1.0.0-success.svg?style=flat-square)](./docs/AONP.md)
[![Zero Runtime Dependencies](https://img.shields.io/badge/dependencies-0%20runtime-brightgreen.svg?style=flat-square)](#)

> **Adaptive Observability Negotiation Protocol (AONP v1.0.0)** e motor de auto-cura interativa em tempo de execução **CrystalBox** para backends de IA Agêntica e APIs modernas.

O `@purecore/aon` transforma APIs tradicionais opacas ("Caixas Pretas") em sistemas transparentes, observáveis e auto-curáveis. Ele permite que clientes—como Agentes Autônomos de IA, orquestradores de LLM, dashboards de SRE e aplicações web—negociem dinamicamente o nível de observabilidade da execução sobre a mesma conexão HTTP utilizando Content Negotiation padrão (RFC 7231).

---

## 🌟 Principais Recursos

- **Negociação de Conteúdo Adaptativa (RFC 7231)**: Alterne transparentemente entre payloads JSON tradicionais e streams de telemetria em tempo real via cabeçalho `Accept`.
- **Streaming Glass Box (NDJSON)**: Emissão de eventos linha-a-linha delimitados por quebra de linha (`status`, `intent_analysis`, `healing`, `result`, `error`) com resposta `200 OK` chunked imediata.
- **❄️👁️ CrystalBox Mode**: Observabilidade bidirecional interativa com suporte a `103 Early Hints`, `102 Processing` e intervenção colaborativa human-in-the-loop.
- **Human-in-the-Loop Especializado**: Separação clara entre `Human-Dev-in-the-loop` (alertas técnicos de infraestrutura via Slack/WhatsApp) e `Human-User-in-the-loop` (decisões de negócio e risco).
- **Auto-cura em Tempo de Execução (Self-Healing)**: Execução transparente de rotinas de reparo (renovação de tokens, reconexão de banco, backoff de rate limit, correção de schemas) antes de falhar com erro 500.
- **Zero Dependências em Runtime**: Desenvolvido 100% sobre a biblioteca padrão do Node.js (`node:http`, `node:crypto`). Compatível com `http` nativo, Express, Fastify, Connect e Hono.
- **Dual ESM / CommonJS**: Totalmente tipado com TypeScript (`.d.ts` e `.d.cts`).

---

## 🔍 Modos de Observabilidade

| Recurso | Modo Black Box | Modo Glass Box | Modo ❄️👁️ CrystalBox |
| :--- | :---: | :---: | :---: |
| **Cabeçalho de Requisição** | `Accept: application/json` | `Accept: application/x-ndjson` | `X-Crystal-Mode: interactive` |
| **Formato de Resposta** | JSON único | Stream NDJSON (`\n`) | Stream NDJSON Interativo |
| **Telemetria Intermediária** | ❌ Oculta | ✅ Chunks em tempo real | ✅ Chunks em tempo real |
| **Auto-cura Automática** | ✅ Silenciosa | ✅ Emitida no Stream | ✅ Emitida no Stream |
| **Human-in-the-Loop** | ❌ Não | ❌ Observação Passiva | ✅ **Intervenção Bidirecional** |
| **Preload / Status HTTP** | ❌ Não | ❌ 200 OK Padrão | ✅ **103 Early Hints & 102 Processing** |
| **Compatibilidade Legada** | ✅ 100% Compatível | ✅ Sob Demanda (Opt-in) | ✅ Sob Demanda (Opt-in) |

---

## 🚀 Instalação e Uso Rápido

### Instalação

```bash
npm install @purecore/aon
```

### Exemplo de Uso com Express

```typescript
import express from 'express';
import { aonMiddleware, withAON } from '@purecore/aon';

const app = express();

// 1. Registra o middleware AON globalmente
app.use(aonMiddleware({
  enabled: true,
  productionDetailLevel: 'standard',
  healingTimeout: 10000
}));

// 2. Envolve a rota com recursos AON
app.get('/api/v1/users/:id', withAON(async (req, res, writer, healer) => {
  writer.status('Conectando ao banco de réplica...', 120);

  // Auto-cura caso haja perda de conexão
  await healer.heal(
    'recover_db_connection',
    'Conexão primária instável, chaveando para réplica',
    { replica: 'us-east-1b' }
  );

  writer.status('Buscando perfil do usuário...');

  // O retorno é automaticamente convertido em evento 'result' (no Glass Box)
  // ou entregue via res.json() tradicional (no Black Box)!
  return {
    id: req.params.id,
    name: 'Ada Lovelace',
    tier: 'enterprise'
  };
}));

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
```

---

## 📜 Especificações Oficiais (RFCs)

O `@purecore/aon` é a implementação canônica de referência das seguintes especificações:

- [RFC-0001: Adaptive Observability Negotiation Protocol (AONP v1.0.0)](./docs/AONP.md)
- [RFC-0004: Observability Modes & CrystalBox Specification](./docs/Observability.modes.md)
- [RFC-0005: Interactive Runtime Healing Specification (IRH)](./docs/InteractiveHealing.md)
- [Glossário Ubíquo do Domínio](./CONTEXT.md)

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Consulte o [Guia de Contribuição](./CONTRIBUTING.md) e o [Código de Conduta](./CODE_OF_CONDUCT.md).

```bash
npm install
npm run typecheck
npm test
npm run build
```

---

## 📄 Licença

[MIT](./LICENSE) © 2026 PureCore Team & Contributors
