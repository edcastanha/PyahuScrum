# Quickstart - Frontend-Only GitHub Login

## Prerequisites
- Node.js 18+
- npm

## Setup
1. Acesse `DevPortfolio/`
2. Rode `npm install`
3. Rode `npm start`

## Validate Main Flow
1. Abrir `http://localhost:3000`
2. Confirmar home como login
3. Informar username GitHub válido
4. Confirmar redirecionamento ao dashboard
5. Recarregar página e validar sessão restaurada
6. Fazer logout e validar retorno à home

## Validate Errors
1. Testar username inexistente
2. Simular falha de rede
3. Validar mensagens e opção de tentar novamente

## Automated Tests
- `npm test` em `DevPortfolio/`
