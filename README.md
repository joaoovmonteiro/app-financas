# Personal Finance App

Um aplicativo completo de controle financeiro pessoal desenvolvido com React, TypeScript e Express.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 20 ou superior
- NPM ou Yarn

### Instalação e Execução

1. **Clone o repositório** (se necessário)
   ```bash
   git clone <url-do-repositorio>
   cd personal-finance-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**
   - O aplicativo estará disponível em: `http://localhost:5000`
   - O servidor Express e o cliente React rodam na mesma porta

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor em modo produção
- `npm run check` - Verifica tipos TypeScript
- `npm run db:push` - Sincroniza o esquema do banco de dados

## 🏗️ Arquitetura do Projeto

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler e servidor de desenvolvimento
- **TanStack Query** para gerenciamento de estado do servidor
- **Shadcn/ui** + **Radix UI** para componentes
- **Tailwind CSS** para estilização
- **Chart.js** para gráficos e visualizações

### Backend
- **Express.js** com TypeScript
- **Drizzle ORM** para modelagem de dados
- **PostgreSQL** como banco de dados (via Neon Database)
- **Armazenamento em memória** (MemStorage) para demo

### Estrutura de Pastas

```
├── client/src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Hooks customizados
│   └── lib/           # Utilitários e configurações
├── server/
│   ├── index.ts       # Servidor Express
│   ├── routes.ts      # Rotas da API
│   └── storage.ts     # Interface de armazenamento
├── shared/
│   └── schema.ts      # Esquemas e tipos compartilhados
└── components.json    # Configuração do Shadcn/ui
```

## 📱 Funcionalidades

### Dashboard
- Visão geral do saldo atual
- Resumo de receitas e despesas do mês
- Transações recentes
- Gráficos de despesas por categoria

### Transações
- ✅ Criar nova transação (receita ou despesa)
- ✅ Editar transações existentes
- ✅ Excluir transações
- ✅ Filtrar por tipo e buscar por descrição
- ✅ Validação especial para categoria "Outros" (descrição obrigatória)

### Orçamentos
- Criar orçamentos mensais por categoria
- Acompanhar gastos vs orçamento planejado
- Indicadores visuais de progresso

### Metas Financeiras
- Definir metas de economia
- Acompanhar progresso em tempo real
- Visualização do tempo restante

### Estatísticas
- Gráficos de despesas por categoria
- Análise de tendências mensais
- Relatórios visuais interativos

## 🎨 Características do Design

- **Interface Escura**: Design profissional otimizado para uso prolongado
- **Mobile-First**: Totalmente responsivo para dispositivos móveis
- **Navegação por Abas**: Interface intuitiva com navegação inferior
- **Animações Suaves**: Transições fluidas entre telas
- **Componentes Acessíveis**: Baseado em Radix UI para máxima acessibilidade

## 🔧 Configuração de Desenvolvimento

### Banco de Dados
O projeto está configurado para usar PostgreSQL via Neon Database. Para uso em produção:

1. Configure a variável de ambiente `DATABASE_URL`
2. Execute as migrações: `npm run db:push`

### Variáveis de Ambiente
Crie um arquivo `.env` com:
```env
DATABASE_URL=sua-string-de-conexao-postgres
PORT=5000
```

## 🚀 Deploy

O projeto está otimizado para deploy no Replit. Para outros ambientes:

1. Execute `npm run build`
2. Configure `NODE_ENV=production`
3. Execute `npm start`

## 📝 Validações e Regras de Negócio

- **Descrição opcional**: Não é obrigatória por padrão
- **Categoria "Outros"**: Descrição torna-se obrigatória
- **Valores monetários**: Aceita formato brasileiro (vírgula como decimal)
- **Categorias padrão**: Alimentação, Transporte, Lazer, Contas, Salário, Outros

## 🛠️ Tecnologias Utilizadas

### Core
- TypeScript
- React 18
- Express.js
- Node.js 20

### UI/UX
- Tailwind CSS
- Shadcn/ui
- Radix UI
- Lucide React (ícones)
- Chart.js

### Estado e Dados
- TanStack Query
- Drizzle ORM
- Zod (validação)
- React Hook Form

### Desenvolvimento
- Vite
- ESBuild
- PostCSS
- Autoprefixer

---

**Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento web moderno.**