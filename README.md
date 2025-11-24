# 🍽️ Cardápio Digital

Sistema completo de cardápio digital com gestão de pedidos em tempo real, desenvolvido com Next.js 14 (App Router) no frontend e Node.js + TypeScript + Prisma no backend.

## 🔗 Links do Projeto

- **🌐 Frontend em Produção**: [https://cardapio-digital-vinicius.vercel.app](https://cardapio-digital-vinicius.vercel.app)
- **🚀 Backend em Produção**: [https://cardapio-digital-backend.vercel.app](https://cardapio-digital-backend.vercel.app)
- **💻 Repositório Frontend**: [https://github.com/vinicius-pascoal/cardapio-digital](https://github.com/vinicius-pascoal/cardapio-digital)
- **⚙️ Repositório Backend**: [https://github.com/vinicius-pascoal/cardapio-digital-backend](https://github.com/vinicius-pascoal/cardapio-digital-backend)

---

## 📋 Sobre o Projeto

O Cardápio Digital é uma solução completa para restaurantes, lanchonetes e estabelecimentos alimentícios que desejam modernizar o atendimento e gestão. O sistema oferece uma experiência integrada para clientes e gestores, com comunicação em tempo real via Server-Sent Events (SSE).

### 🎯 Para Clientes:
- 📱 Visualizar cardápio organizado por categorias
- 🛒 Adicionar itens ao carrinho com facilidade
- 📝 Fazer pedidos de forma simples e rápida
- ✨ Interface responsiva e intuitiva

### 🎯 Para Gestores:
- 📊 Dashboard com métricas em tempo real
- 📈 Análise de vendas e desempenho
- 🔔 Notificações instantâneas de novos pedidos (SSE)
- 🎯 Gestão completa de categorias e pratos
- 📦 Controle total de pedidos com histórico
- 📉 Gráficos e relatórios de análise

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

---

## 🚀 Tecnologias

### 💻 Frontend
- **Next.js 15.3.4** (App Router)
- **React 19.0.0**
- **TypeScript**
- **TailwindCSS** (estilização)
- **Recharts** (gráficos e visualizações)
- **SweetAlert2** (alertas e modais)
- **React Context API** (gerenciamento de estado)
- **Server-Sent Events (SSE)** (notificações em tempo real)

### ⚙️ Backend
- **Node.js**
- **TypeScript**
- **Express** (framework web)
- **Prisma ORM** (banco de dados)
- **MySQL** (banco de dados)
- **Zod** (validação de schemas)
- **Redis/Upstash** (pub/sub para SSE em produção)
- **Docker** (containerização)

---

## 🛠️ Instalação e Execução

### ⚡ Pré-requisitos
- Node.js 18+
- npm, yarn, pnpm ou bun
- Backend rodando (ver seção Backend abaixo)

### 💻 Frontend

1. **Clone o repositório**
```bash
git clone https://github.com/vinicius-pascoal/cardapio-digital.git
cd cardapio-digital
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# ou para produção
NEXT_PUBLIC_API_URL=https://cardapio-digital-backend.vercel.app
```

4. **Execute o projeto em desenvolvimento**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

5. **Build para produção**
```bash
npm run build
npm start
```

### ⚙️ Backend

O backend possui seu próprio repositório. Consulte a [documentação do backend](https://github.com/vinicius-pascoal/cardapio-digital-backend) para instruções completas.

**Resumo rápido com Docker:**
```bash
# Clone o repositório do backend
git clone https://github.com/vinicius-pascoal/cardapio-digital-backend.git
cd cardapio-digital-backend

# Configure o ambiente
cp .env.example .env

# Suba os containers
docker compose up -d --build

# Aplique as migrations
docker compose exec api npx prisma migrate deploy

# (Opcional) Popule com dados de exemplo
docker compose exec api npm run prisma:seed
```

A API estará em `http://localhost:3000` e o MySQL em `localhost:3306`

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

---

## 📡 Integração Backend e API

### 🌐 Endpoints Principais

O frontend se comunica com o backend através dos seguintes endpoints:

#### Health Check
- `GET /health` - Verifica status da API

#### Categorias
- `GET /api/categories` - Lista todas as categorias
- `GET /api/categories/:id` - Busca categoria específica
- `POST /api/categories` - Cria nova categoria
- `PUT /api/categories/:id` - Atualiza categoria
- `DELETE /api/categories/:id` - Deleta categoria

#### Pratos
- `GET /api/dishes` - Lista todos os pratos com categorias
- `GET /api/dishes/:id` - Busca prato específico
- `POST /api/dishes` - Cria novo prato
- `PUT /api/dishes/:id` - Atualiza prato
- `DELETE /api/dishes/:id` - Deleta prato

#### Pedidos
- `GET /api/orders` - Lista todos os pedidos
- `GET /api/orders/:id` - Busca pedido específico
- `POST /api/orders` - Cria novo pedido
- `PUT /api/orders/:id` - Atualiza pedido
- `DELETE /api/orders/:id` - Deleta pedido

#### Server-Sent Events (SSE)
- `GET /api/orders/stream` - Stream de notificações em tempo real
- `GET /api/sse/status` - Status das conexões SSE

### 📨 Exemplo de Uso do SSE

O sistema utiliza SSE para notificações em tempo real:

```typescript
const eventSource = new EventSource('https://cardapio-digital-backend.vercel.app/api/orders/stream');

// Novo pedido criado
eventSource.addEventListener('new-order', (event) => {
  const order = JSON.parse(event.data);
  console.log('Novo pedido:', order);
  // Atualiza UI e exibe notificação
});

// Pedido atualizado
eventSource.addEventListener('order-update', (event) => {
  const order = JSON.parse(event.data);
  console.log('Pedido atualizado:', order);
});

// Pedido deletado
eventSource.addEventListener('order-delete', (event) => {
  const { id } = JSON.parse(event.data);
  console.log('Pedido deletado:', id);
});
```

### 📝 Exemplo de Requisição

**Criar um pedido:**
```typescript
const response = await fetch('https://cardapio-digital-backend.vercel.app/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      { pratoId: 1, quantidade: 2 },
      { pratoId: 3, quantidade: 1 }
    ]
  })
});

const order = await response.json();
// { id: 1, criadoEm: "2025-11-24T...", itens: [...], total: 89.70 }
```

---

## 🎯 Fluxo de Uso

### 👤 Cliente (Fazer Pedido)
1. 🏠 Acessa a página inicial do cardápio
2. 🔍 Navega pelas categorias e pratos
3. 🛒 Adiciona itens ao carrinho
4. 👁️ Revisa o pedido no modal
5. ✅ Finaliza o pedido
6. 🎉 Recebe confirmação visual

### 👨‍💼 Gestor (Gerenciar)
1. 🔐 Faz login no sistema (senha: `admin123`)
2. 📊 Acessa o dashboard com métricas
3. 📈 Visualiza estatísticas em tempo real
4. 🔔 Recebe notificação de novo pedido (SSE)
5. 📦 Gerencia pedidos na página Orders
6. 📉 Analisa dados na página Analytics

---

## 📊 Funcionalidades em Destaque

### 🔴 Real-time com SSE
- ⚡ Atualização automática de pedidos sem polling
- 🔌 Conexão persistente com o backend
- 📢 Notificações instantâneas de novos pedidos
- 🔄 Sincronização entre múltiplas instâncias via Redis

### ✏️ Edição Inline
- 📝 Edite categorias e pratos diretamente na tabela
- ✅ Validação em tempo real
- 🎨 Feedback visual durante edição
- 💾 Salvamento automático

### 📈 Analytics Avançado
- 📊 Visualização de tendências de vendas
- ⏰ Análise de horários de pico
- 🏆 Identificação dos pratos mais populares
- 📅 Filtros flexíveis (semanal/mensal)
- 📉 Gráficos interativos (Recharts)

### 🎨 Design Moderno
- ✨ Interface moderna com gradientes e animações sutis
- 📱 Design totalmente responsivo (mobile e desktop)
- 🖱️ Scrollbar customizado
- 💬 Feedback visual consistente
- 🎨 Paleta de cores harmoniosa e profissional

---

## 📊 Estrutura do Banco de Dados

```prisma
model Categoria {
  id     Int     @id @default(autoincrement())
  nome   String
  pratos Prato[]
}

model Prato {
  id          Int          @id @default(autoincrement())
  nome        String
  descricao   String?
  preco       Decimal
  categoriaId Int
  categoria   Categoria    @relation(fields: [categoriaId], references: [id])
  itensPedido ItemPedido[]
}

model Pedido {
  id        Int          @id @default(autoincrement())
  criadoEm  DateTime     @default(now())
  itens     ItemPedido[]
}

model ItemPedido {
  id         Int    @id @default(autoincrement())
  pedidoId   Int
  pratoId    Int
  quantidade Int
  pedido     Pedido @relation(fields: [pedidoId], references: [id])
  prato      Prato  @relation(fields: [pratoId], references: [id])
}
```

---

## 🔒 Segurança

- ✅ Validação de dados com Zod no backend
- 🧹 Sanitização de inputs
- 🛡️ Headers de segurança configurados
- 🌐 CORS configurado adequadamente
- 🔐 Proteção contra SQL Injection (Prisma ORM)
- 🔑 Variáveis de ambiente para dados sensíveis
- 🚫 Autenticação para rotas administrativas

---

## 🚀 Deploy

### 🌐 Frontend (Vercel)
1. Conecte seu repositório GitHub à Vercel
2. Configure a variável de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://cardapio-digital-backend.vercel.app
   ```
3. Deploy automático a cada push na branch `main`

### ⚙️ Backend (Vercel)
Consulte o [repositório do backend](https://github.com/vinicius-pascoal/cardapio-digital-backend) para instruções detalhadas de deploy com:
- Configuração do MySQL
- Variáveis de ambiente
- Redis/Upstash para SSE em produção
- Migrations do Prisma

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. 🍴 Fork o projeto
2. 🌿 Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. 📤 Push para a branch (`git push origin feature/MinhaFeature`)
5. 🔄 Abra um Pull Request

### 📋 Diretrizes
- Mantenha o código limpo e bem documentado
- Siga os padrões de código existentes
- Teste suas mudanças antes de submeter
- Descreva claramente o que foi alterado no PR

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Vinicius Pascoal**

- 🐙 GitHub: [@vinicius-pascoal](https://github.com/vinicius-pascoal)
- 💼 LinkedIn: [Em breve]
- 📧 Email: [Em breve]

---

## 📞 Suporte

Encontrou um problema ou tem alguma dúvida?

- 🐛 [Reporte um bug](https://github.com/vinicius-pascoal/cardapio-digital/issues/new?labels=bug)
- 💡 [Sugira uma feature](https://github.com/vinicius-pascoal/cardapio-digital/issues/new?labels=enhancement)
- 💬 [Discussões](https://github.com/vinicius-pascoal/cardapio-digital/discussions)

---

## 🎉 Agradecimentos

Agradecimentos especiais a:
- Comunidade Next.js pela excelente documentação
- Equipe Vercel pela plataforma de deploy
- Todos os contribuidores de bibliotecas open-source utilizadas
- Você, por se interessar pelo projeto! ⭐

---

## 📈 Roadmap

### 🚧 Em Desenvolvimento
- [ ] Sistema de autenticação completo (JWT)
- [ ] Múltiplos níveis de usuário (admin, garçom, cozinha)
- [ ] Upload de imagens para pratos
- [ ] Sistema de avaliações e comentários
- [ ] Relatórios em PDF

### 💡 Planejado
- [ ] App mobile com React Native
- [ ] Sistema de reservas de mesas
- [ ] Integração com meios de pagamento
- [ ] QR Code para acesso rápido ao cardápio
- [ ] Modo escuro
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)

---
