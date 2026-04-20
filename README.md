# 🧬 Sualuma Online: Ecossistema de MicroSaaS & Blog IA

Este repositório contém o ecossistema completo da **Sualuma Online**, composto por uma plataforma de automação futurista, um cérebro de agentes de IA e um sistema de blog automatizado.

---

## 📂 Estrutura do Projeto (Monorepo)

- **`agents-api/`** 🧠: Backend em Node.js que gerencia os 5 Agentes de IA (Gemini/Ollama).
- **`microsaas-core/`** ⚡: Front-end Next.js Premium com a interface de chat e dashboard.
- **`microsaas-blog/`** ✍️: Sistema de Blog Next.js para SEO e autoridade de marca.
- **`v1-original-luma/`** 📁: Código legado original preservado.

---

## 🚀 Como fazer o Deploy na VPS (Manual Rápido)

### 1. Clonar o Repositório
```bash
git clone https://github.com/melinda20-ui/Microssas-Luma-business.git
cd Microssas-Luma-business
```

### 2. Instalar Dependências
Você deve rodar o `npm install` em cada uma das pastas principais:
```bash
cd agents-api && npm install && cd ..
cd microsaas-core && npm install && cd ..
cd microsaas-blog && npm install && cd ..
```

### 3. Configurar Variáveis de Ambiente
Crie os arquivos `.env` em cada pasta baseando-se nos exemplos fornecidos.

### 4. Rodar com PM2
Para manter o sistema ligado 24/7 na Hostinger:
```bash
pm2 start agents-api/ecosystem.config.js
```

---

## 🛠️ Tecnologias Utilizadas
- **Frontend**: Next.js 15, TailwindCSS (v4/v3), Lucide React.
- **Backend**: Node.js, Express, Gemini API, Ollama.
- **Banco de Dados**: SQLite (para v2) e Prisma (v1).

---
*Desenvolvido com Antigravity AI para a Sualuma Online.*
