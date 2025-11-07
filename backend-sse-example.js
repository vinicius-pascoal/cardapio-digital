/**
 * EXEMPLO PRÁTICO - SSE Backend
 * Copie este código para o seu arquivo principal do Express (ex: index.js, server.js)
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// PASSO 1: Configurar armazenamento de clientes SSE
// ==========================================
const sseClients = new Set();

// ==========================================
// PASSO 2: Criar endpoint SSE
// ==========================================
app.get('/api/orders/stream', (req, res) => {
  // Headers obrigatórios para SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Adicionar cliente
  sseClients.add(res);
  console.log(`[SSE] Cliente conectado. Total: ${sseClients.size}`);

  // Mensagem de boas-vindas
  res.write('data: {"type":"connected"}\n\n');

  // Heartbeat a cada 30s
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  // Remover ao desconectar
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    console.log(`[SSE] Cliente desconectado. Total: ${sseClients.size}`);
  });
});

// ==========================================
// PASSO 3: Função para enviar eventos
// ==========================================
function notifyClients(eventName, data) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  console.log(`[SSE] Enviando '${eventName}' para ${sseClients.size} clientes`);

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// ==========================================
// PASSO 4: Integrar com suas rotas de pedidos
// ==========================================

// POST /api/orders - Criar pedido
app.post('/api/orders', async (req, res) => {
  try {
    const { items } = req.body;

    // Sua lógica de criar pedido aqui
    // const newOrder = await prisma.pedido.create({ ... });

    // Exemplo de resposta:
    const newOrder = {
      id: Date.now(),
      items: items.map(item => ({
        pratoId: item.pratoId,
        quantidade: item.quantidade,
        prato: {
          nome: 'Pizza Margherita', // Buscar do banco
          preco: 35.00,
        }
      })),
      total: 70.00,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(newOrder);

    // 🔔 NOTIFICAR CLIENTES SSE
    notifyClients('new-order', newOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// PUT /api/orders/:id - Atualizar pedido
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Sua lógica de atualizar pedido
    const updatedOrder = {
      id: Number(id),
      status,
      // ... outros campos
    };

    res.json(updatedOrder);

    // 🔔 NOTIFICAR CLIENTES SSE
    notifyClients('order-update', updatedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// DELETE /api/orders/:id - Deletar pedido
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Sua lógica de deletar pedido
    // await prisma.pedido.delete({ where: { id: Number(id) } });

    res.status(204).send();

    // 🔔 NOTIFICAR CLIENTES SSE
    notifyClients('order-delete', { id: Number(id) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
});

// ==========================================
// PASSO 5: Rotas auxiliares (opcional)
// ==========================================

// GET /api/orders - Listar pedidos
app.get('/api/orders', async (req, res) => {
  // Sua lógica de listar pedidos
  res.json([]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    sseClients: sseClients.size,
    uptime: process.uptime(),
  });
});

// ==========================================
// Iniciar servidor
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📡 SSE disponível em http://localhost:${PORT}/api/orders/stream`);
});

// ==========================================
// EXPORTAR para usar em outros arquivos
// ==========================================
module.exports = { notifyClients };
