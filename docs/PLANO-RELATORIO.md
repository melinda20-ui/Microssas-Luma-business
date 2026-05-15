# Relatório de Planos Antigos — Pré-Unificação

> Gerado em: 15/05/2026  
> Escopo: Mapeamento completo de todas as páginas, rotas e dependências de planos anteriores à unificação do Studio Sualuma.

---

## Sumário

1. [Resumo Executivo](#1-resumo-executivo)
2. [Mapa de Arquivos por App](#2-mapa-de-arquivos-por-app)
3. [Tabela Comparativa de Planos](#3-tabela-comparativa-de-planos)
4. [Rotas Antigas vs Atuais](#4-rotas-antigas-vs-atuais)
5. [Dependências Relacionadas](#5-dependências-relacionadas)
6. [Análise de Reaproveitamento](#6-análise-de-reaproveitamento)
7. [Recomendações](#7-recomendações)

---

## 1. Resumo Executivo

Foram encontradas **4 definições de planos distintas** espalhadas por 3 aplicações, com inconsistências de preços, nomes e quantidades de agentes. A unificação deve consolidar em um único modelo de planos (Free → R$0, Basic → R$49, Pro → R$149) usado pelo backend de billing (Stripe), removendo as variações legadas.

### Planos Encontrados

| Fonte | Planos | Preços |
|-------|--------|--------|
| `v1-original-luma/app/plans/page.tsx` | Teste grátis, Básico, Prime, Premium, Pro | Grátis, R$49, R$97, R$197, R$397 |
| `v1-original-luma/app/agents/page.tsx` | Teste grátis(2), Básico(4), Prime(7), Premium(10), Pro(12) | (apenas contagem de agentes) |
| `microsaas-core/.../dashboard/billing/page.tsx` | Free, Basic, Pro | R$0, R$49, R$149 |
| `microsaas-core/.../planosdeia01/page.tsx` | Lite, Premium, Pro | R$97, R$197, R$397 |
| `agents-api/routes/billing.js` | basic, pro | R$49, R$149 |

---

## 2. Mapa de Arquivos por App

### A. `v1-original-luma` (Legacy — 2 arquivos)

| Arquivo | Rota | Tipo | Descrição |
|---------|------|------|-----------|
| `app/plans/page.tsx` | `/plans` | Next.js Page | Página completa de planos com 5 tiers. CTAs linkam para `/auth`. Stripe mencionado como "coming soon". |
| `app/agents/page.tsx` | `/agents` | Next.js Page | Tabela de agentes por plano. 5 tiers com contagem de agentes liberados (2 a 12). |

**Dependências:** `next/link` apenas. Nenhuma dependência externa.  
**Navegação:** Links de `/plans` vão para `/auth` (sem checkout real).  
**Status:** Totalmente funcional mas sem integração de pagamento. Design independente.

### B. `microsaas-core` (Atual — 2 arquivos)

| Arquivo | Rota | Tipo | Descrição |
|---------|------|------|-----------|
| `src/app/dashboard/billing/page.tsx` | `/dashboard/billing` | Next.js Client Page | 3 planos com integração Stripe via agents-api. Usa `useUser()` do Clerk. |
| `src/app/planosdeia01/page.tsx` | `/planosdeia01` | Next.js Client Page | Página completa com 3 planos + showcase de agentes. Links para Kiwify (checkout externo). |

**Dependências:**  
- `dashboard/billing`: `@clerk/nextjs`, `lucide-react`, fetch para `agents-api:3001`  
- `planosdeia01`: `next/link`, `useState` apenas. Links para `kiwify.com.br`  

**Navegação:**  
- `/dashboard/billing` acessível via `CreditBalance` component → link no header  
- `/planosdeia01` **não linkado** em navbar ou footer — página órfã  

**Status:** `/dashboard/billing` é a página ativa de pagamentos. `/planosdeia01` é uma página experimental/abandonada.

### C. `agents-api` (Backend — 3 arquivos)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `routes/billing.js` | Express Route | 2 planos (basic=R$49, pro=R$149) via Stripe Checkout. Webhook ativa plano no DB. |
| `config/db.js` | DB Schema | Tabela `users` com colunas: `plan TEXT DEFAULT 'free'`, `credits INTEGER DEFAULT 20` |
| `middleware/creditMiddleware.js` | Express Middleware | Consome créditos por chamada de agente. Verifica saldo antes de executar. |
| `services/cleanupJob.js` | Scheduled Job | Reseta créditos para 20 todo dia (plano free). |

**Dependências:** `stripe`, `better-sqlite3`, `express`  
**Observação:** Price IDs do Stripe são placeholders (`price_basic_123`, `price_pro_123`).

### D. `microsaas-blog` (Blog — 1 arquivo)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/services/blogService.ts` | Service | Geração de posts via agente `contentCreator` com `plan: 'pro'` hardcoded. |

---

## 3. Tabela Comparativa de Planos

### Nomenclaturas Diferentes para Mesmo Tier

| Tier Real | v1 `/plans` | v1 `/agents` | core `/billing` | core `/planosdeia01` | API `billing.js` |
|-----------|-------------|--------------|-----------------|---------------------|------------------|
| **Free** | Teste grátis (30d) | Teste grátis | Free (R$0) | — | free |
| **~R$50** | Básico (R$49) | Básico (4 agentes) | Basic (R$49) | — | basic |
| **~R$100** | Prime (R$97) | Prime (7 agentes) | — | Lite (R$97) | — |
| **~R$150** | Premium (R$197) | Premium (10 agentes) | Pro (R$149) | Premium (R$197) | pro |
| **~R$400** | Pro (R$397) | Pro (12 agentes) | — | Pro (R$397) | — |

### Conflitos Identificados

1. **Plano "Pro"** aparece com 3 preços diferentes: R$149 (billing), R$397 (v1/plans), R$397 (planosdeia01)
2. **Plano Premium** no v1 é R$197, mas em `planosdeia01` também é R$197 — mesmo nome, mesmo preço, features diferentes
3. **v1 tem 5 tiers**, billing tem 3 tiers, planosdeia01 tem 3 tiers — 3 modelagens diferentes
4. **Plano "Lite"** (R$97) só existe em `planosdeia01`
5. **Plano "Prime"** (R$97) só existe no v1

---

## 4. Rotas Antigas vs Atuais

### Rotas de Planos Ativas

| Rota | App | Status | Recomendação |
|------|-----|--------|--------------|
| `/dashboard/billing` | core | **Ativa** (Stripe) | MANTER como rota oficial de billing |
| `/api/billing/checkout` | agents-api | **Ativa** | MANTER |
| `/api/billing/webhook` | agents-api | **Ativa** | MANTER |
| `/api/user/:clerkId` | agents-api | **Ativa** | MANTER |

### Rotas de Planos Legadas / Órfãs

| Rota | App | Status | Recomendação |
|------|-----|--------|--------------|
| `/plans` | v1 | **Ativa** (sem pagamento) | MANTER (v1 legacy, não quebrar) |
| `/planosdeia01` | core | **Órfã** (não linkada) | MANTER (pode ser reativada como landing) |
| `/agents` | v1 | **Ativa** | MANTER (referencia planos) |

### Rotas de Portal (Relacionadas)

| Rota | App | Descrição |
|------|-----|-----------|
| `/portal` | core | Portal de escolha (Cliente IA vs Prestador) |
| `/ideiaplano` | core | Idêntica a `/portal` — duplicata experimental |

---

## 5. Dependências Relacionadas

### Dependências de Código

| Componente/Rota | Depende de | Usado por |
|-----------------|-----------|-----------|
| `/dashboard/billing` | `@clerk/nextjs`, `agents-api:3001` | Frontend (cliente logado) |
| `CreditBalance.tsx` | `@clerk/nextjs`, `/api/user/:clerkId` | Navbar (exibe saldo) |
| `routes/billing.js` | `stripe`, `config/db` | API (checkout + webhook) |
| `creditMiddleware.js` | `config/db` | Todas as rotas de agentes |
| `cleanupJob.js` | `config/db` | Reset de créditos free |
| `chat/page.tsx` | `@clerk/nextjs`, `agents-api` | Envia `plan: 'premium'` hardcoded |
| `websiteBuilder.js` | `config/llm` | Lê `plan` para features adicionais |
| `contentCreator.js` | `config/llm` | Lê `plan` para limites de quantidade |

### Dependências de Infraestrutura

| Recurso | Uso | Status |
|---------|-----|--------|
| Stripe API | Checkout + webhooks | Placeholder (`price_*_123`) |
| Kiwify | Checkout externo (legado) | Apenas em `/planosdeia01` |
| SQLite (`sualuma.db`) | Armazenamento de planos/usuários | Ativo |

---

## 6. Análise de Reaproveitamento

### Arquivos com Alto Potencial de Reuso

| Arquivo | Motivo | Ação Sugerida |
|---------|--------|---------------|
| `dashboard/billing/page.tsx` | Já integrado com Stripe via API | Refatorar para usar planos unificados |
| `routes/billing.js` | Backend de billing funcional | Substituir price IDs placeholders por reais |
| `creditMiddleware.js` | Sistema de créditos consolidado | Já integrado com role/super-admin |
| `cleanupJob.js` | Reset automático de créditos | Já funcional |

### Arquivos com Baixo Potencial de Reuso

| Arquivo | Motivo |
|---------|--------|
| `v1/app/plans/page.tsx` | Design e dados completamente diferentes do novo modelo |
| `v1/app/agents/page.tsx` | Tabela de agentes por plano desatualizada |
| `core/planosdeia01/page.tsx` | Usa Kiwify (checkout externo não integrado) |

### Arquivos Órfãos para Manter (Não Remover)

| Arquivo | Razão |
|---------|-------|
| `core/planosdeia01/page.tsx` | Pode ser reativada como landing page experimental |
| `core/ideiaplano/page.tsx` | Duplicata de `/portal` — manter para compatibilidade |
| `v1/app/plans/page.tsx` | Legacy preservation |
| `v1/app/agents/page.tsx` | Legacy preservation |

---

## 7. Recomendações

### Curto Prazo
1. Substituir `price_basic_123` / `price_pro_123` por Price IDs reais do Stripe Dashboard
2. Remover hardcoded `plan: 'premium'` em `chat/page.tsx` — buscar do backend
3. Corrigir link `/#planos` no Footer (atualmente quebrado — redireciona para `/funilmaster`)

### Médio Prazo
4. Unificar modelo de planos para: **Free** (R$0 / 20 créditos/dia) → **Basic** (R$49 / 200 créditos/mês) → **Pro** (R$149 / 1000 créditos/mês)
5. Migrar `v1/app/plans/page.tsx` e `v1/app/agents/page.tsx` para consumir dados do backend unificado
6. Avaliar se `/planosdeia01` deve ser linkada na navegação ou arquivada

### Longo Prazo
7. Migrar de SQLite para PostgreSQL (Prisma) para suportar multi-tenancy
8. Implementar sistema de roles mais granular (admin, editor, user)
9. Criar portal de admin unificado com gestão de planos e usuários

---

## Arquivos Modificados neste Bloco

### BLOCO 1 — Infraestrutura e Segurança

| Arquivo | Modificação |
|---------|------------|
| `agents-api/config/db.js` | Add coluna `role`, migração, seed super-admin |
| `agents-api/middleware/creditMiddleware.js` | Auto-promoção super-admin no login |
| `agents-api/server.js` | Rota `/api/user/:clerkId/super-admin` |
| `microsaas-core/src/middleware.ts` | **Novo** — Gatekeeper do subdomínio studio |
| `v1-original-luma/middleware.ts` | Gatekeeper do subdomínio studio |
