# 🧠 Sualuma Agents API

O cérebro por trás da automação do ecossistema.

## ⚙️ Configuração
1. Instale as dependências: `npm install`.
2. Configure o arquivo `.env`:
   - `GEMINI_API_KEY`: Sua chave do Google AI.
   - `PORT`: 3001.

## 🤖 Agentes Disponíveis
- **Website Builder**: Porta de entrada para criação de sites.
- **Content Creator**: Especialista em marketing e escrita.
- **Support Agent (Mia)**: Chat de atendimento ao cliente.
- **BI Agent**: Analista de dados inteligente.
- **Automation Agent**: Gerador de fluxos n8n.

## 🚀 Execução
- Desenvolvimento: `npm start`.
- Produção: `pm2 start ecosystem.config.js`.
