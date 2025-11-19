# 🍽️ Cardápio Digital

Sistema completo de cardápio digital com painel administrativo, área do cliente e gerenciamento de pedidos em tempo real.

## 📋 Sobre o Projeto

Aplicação web moderna desenvolvida com Next.js para gerenciamento de restaurantes, permitindo que clientes visualizem o menu, façam pedidos e acompanhem em tempo real, enquanto o estabelecimento gerencia categorias, pratos, pedidos e analisa dados de vendas.

## ✨ Funcionalidades

### 👤 Área do Cliente
- Visualização do cardápio completo com categorias
- Filtragem de pratos por categoria e pesquisa
- Carrinho de compras com gerenciamento de itens
- Acompanhamento de pedidos em tempo real via SSE (Server-Sent Events)
- Interface responsiva e moderna

### 🔐 Painel Administrativo (`/dashboard`)
- **Autenticação**: Sistema de login com senha
- **Dashboard Principal**:
  - Cards com estatísticas (total de pedidos, receita, ticket médio)
  - Lista de pedidos recentes com design aprimorado
  - Filtros por data e faixa de preço
- **Gerenciamento de Categorias**:
  - Listagem, criação, edição e exclusão
  - Edição inline na tabela
- **Gerenciamento de Pratos**:
  - Listagem, criação, edição e exclusão
  - Campos: nome, descrição, preço, categoria
  - Edição inline com validação
  - Filtros de pesquisa e preço
- **Pedidos** (`/orders`):
  - Visualização completa de todos os pedidos
  - Ordenação por data (mais recentes primeiro)
  - Detalhes de itens, valores e horários
- **Análise de Dados** (`/analytics`):
  - Visualização semanal/mensal
  - Gráficos interativos com Recharts:
    - Pedidos por horário
    - Pedidos por dia da semana
    - Receita por dia
    - Top 5 pratos mais vendidos
  - Estatísticas consolidadas

## 🛠️ Tecnologias

- **Framework**: Next.js 15.3.4 (App Router)
- **Frontend**: React 19.0.0, TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Notificações**: SweetAlert2
- **Real-time**: Server-Sent Events (SSE)
- **Backend**: API REST integrada ([cardapio-digital-backend](https://cardapio-digital-backend.vercel.app))

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm, yarn, pnpm ou bun

### Instalação

```bash
# Clone o repositório
git clone https://github.com/vinicius-pascoal/cardapio-digital.git

# Entre na pasta do projeto
cd cardapio-digital

# Instale as dependências
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
cardapio-digital/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Painel administrativo
│   │   ├── login/             # Tela de login
│   │   ├── orders/            # Visualização de pedidos
│   │   ├── analytics/         # Análise de dados
│   │   ├── page.tsx           # Página principal (cardápio)
│   │   └── layout.tsx         # Layout global
│   ├── components/            # Componentes reutilizáveis
│   │   ├── CartButton.tsx     # Botão do carrinho
│   │   ├── CartModal.tsx      # Modal do carrinho
│   │   ├── CartProvider.tsx   # Context do carrinho
│   │   └── ...
│   ├── lib/
│   │   └── api.ts             # Cliente API e tipos
│   └── img/                   # Imagens
├── public/                    # Arquivos estáticos
└── ...
```

## 🔑 Credenciais de Acesso

**Dashboard Admin**: 
- Senha: `admin123`

## 🌐 API Backend

O projeto se integra com a API REST hospedada em:
- URL: `https://cardapio-digital-backend.vercel.app`
- Endpoints:
  - `/categorias` - Gerenciamento de categorias
  - `/pratos` - Gerenciamento de pratos
  - `/pedidos` - Gerenciamento de pedidos
  - `/pedidos/sse` - Stream de pedidos em tempo real

## 📊 Funcionalidades em Destaque

### Real-time com SSE
- Atualização automática de pedidos sem polling
- Conexão persistente com o backend
- Notificações instantâneas de novos pedidos

### Edição Inline
- Edite categorias e pratos diretamente na tabela
- Validação em tempo real
- Feedback visual durante edição

### Analytics Avançado
- Visualização de tendências de vendas
- Análise de horários de pico
- Identificação dos pratos mais populares
- Filtros flexíveis (semanal/mensal)

## 🎨 Design

- Interface moderna com gradientes e animações sutis
- Design responsivo para mobile e desktop
- Scrollbar customizado
- Feedback visual consistente
- Paleta de cores harmoniosa

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e demonstrativos.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Contato

Desenvolvido por [Vinicius Pascoal](https://github.com/vinicius-pascoal)
