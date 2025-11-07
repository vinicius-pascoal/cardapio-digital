import { useEffect, useRef, useCallback } from 'react';

interface UseOrdersSSEOptions {
  onNewOrder?: (order: any) => void;
  onOrderUpdate?: (order: any) => void;
  onOrderDelete?: (orderId: number) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

/**
 * Hook para conectar ao SSE de pedidos do backend
 * Recebe atualizações em tempo real quando pedidos são criados, atualizados ou deletados
 */
export function useOrdersSSE({
  onNewOrder,
  onOrderUpdate,
  onOrderDelete,
  onError,
  enabled = true,
}: UseOrdersSSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 segundo

  const connect = useCallback(() => {
    // Evita executar em SSR / build (prerender) onde window/EventSource não existem
    if (!enabled || typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const sseUrl = `${apiUrl}/api/orders/stream`;

    console.log('[SSE] Conectando ao servidor:', sseUrl);

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Conexão estabelecida com sucesso');
        reconnectAttemptsRef.current = 0; // Reset contador de tentativas
      };

      // Evento: novo pedido criado
      eventSource.addEventListener('new-order', (event: MessageEvent) => {
        console.log('[SSE] Novo pedido recebido:', event.data);
        try {
          const order = JSON.parse(event.data);
          onNewOrder?.(order);
        } catch (err) {
          console.error('[SSE] Erro ao parsear novo pedido:', err);
        }
      });

      // Evento: pedido atualizado
      eventSource.addEventListener('order-update', (event: MessageEvent) => {
        console.log('[SSE] Pedido atualizado:', event.data);
        try {
          const order = JSON.parse(event.data);
          onOrderUpdate?.(order);
        } catch (err) {
          console.error('[SSE] Erro ao parsear atualização:', err);
        }
      });

      // Evento: pedido deletado
      eventSource.addEventListener('order-delete', (event: MessageEvent) => {
        console.log('[SSE] Pedido deletado:', event.data);
        try {
          const data = JSON.parse(event.data);
          onOrderDelete?.(data.id);
        } catch (err) {
          console.error('[SSE] Erro ao parsear deleção:', err);
        }
      });

      // Tratamento de erros
      eventSource.onerror = (error) => {
        console.error('[SSE] Erro na conexão:', error);
        eventSource.close();
        eventSourceRef.current = null;
        onError?.(error);

        // Tentar reconectar com backoff exponencial
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`[SSE] Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error('[SSE] Número máximo de tentativas de reconexão atingido');
        }
      };
    } catch (err) {
      console.error('[SSE] Erro ao criar conexão:', err);
    }
  }, [enabled, onNewOrder, onOrderUpdate, onOrderDelete, onError]);

  const disconnect = useCallback(() => {
    console.log('[SSE] Desconectando...');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Hook só conecta no cliente
    if (typeof window !== 'undefined') {
      connect();
    }
    return () => disconnect();
  }, [connect, disconnect]);

  // Evitar referência direta à classe EventSource em ambiente SSR
  const isConnected = typeof window !== 'undefined'
    && typeof EventSource !== 'undefined'
    && eventSourceRef.current?.readyState === 1; // 1 = OPEN

  return {
    disconnect,
    reconnect: () => {
      disconnect();
      reconnectAttemptsRef.current = 0;
      connect();
    },
    isConnected,
  };
}
