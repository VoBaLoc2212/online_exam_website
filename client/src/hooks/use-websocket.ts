import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  event?: string;
  sessionId?: string;
}

export function useWebSocket(sessionId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  
  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };
  
  const sendAntiCheatEvent = (event: string, data?: any) => {
    sendMessage({
      type: 'anti_cheat_event',
      event,
      data,
    });
  };
  
  useEffect(() => {
    // Nếu chưa login/register thì không connect
    if (!sessionId) return;

    // Nếu muốn disable WS hoàn toàn (ví dụ server chưa bật)
    if (import.meta.env.VITE_DISABLE_WS === 'true') {
      console.warn('WebSocket disabled (VITE_DISABLE_WS=true)');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (err) {
      console.warn('WebSocket connection failed to create:', err);
      return;
    }

    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      sendMessage({
        type: 'join_session',
        sessionId,
      });
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.warn('WebSocket error (server may not be running):', error);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [sessionId]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendAntiCheatEvent,
  };
}
