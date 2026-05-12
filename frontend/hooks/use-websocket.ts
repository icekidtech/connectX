/**
 * useWebSocket Hook
 * 
 * Manages Socket.io connection with exponential backoff reconnection
 * Exponential backoff: 1s, 2s, 4s, 8s, 16s (capped at 30s)
 * Max 5 retries before showing "Connection Lost" error
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type WebSocketConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

interface UseWebSocketReturn {
  socket: Socket | null;
  status: WebSocketConnectionStatus;
  reconnect: () => void;
  error: string | null;
}

const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000]; // ms
const MAX_BACKOFF = 30000; // 30 seconds
const MAX_RETRIES = 5;

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getBackoffDelay = useCallback((retryCount: number): number => {
    const delayMs = BACKOFF_DELAYS[retryCount] || MAX_BACKOFF;
    return Math.min(delayMs, MAX_BACKOFF);
  }, []);

  const reconnect = useCallback(() => {
    if (retriesRef.current >= MAX_RETRIES) {
      setStatus('error');
      setError('Max connection retries reached. Please refresh the page.');
      return;
    }

    setStatus('reconnecting');
    const delay = getBackoffDelay(retriesRef.current);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      retriesRef.current += 1;
      if (socketRef.current) {
        socketRef.current.connect();
      }
    }, delay);
  }, [getBackoffDelay]);

  // Initialize socket connection
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      socketRef.current = io(API_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: MAX_RETRIES,
        auth: {
          // Note: Token auth will be handled via query param or custom auth
          // This needs backend support to generate a WebSocket token
          token: '', // Will be populated via custom auth method
        },
      });

      // Connection established
      socketRef.current.on('connect', () => {
        setStatus('connected');
        setError(null);
        retriesRef.current = 0; // Reset retry counter on successful connection
      });

      // Connection lost
      socketRef.current.on('disconnect', () => {
        setStatus('disconnected');
      });

      // Reconnection attempt
      socketRef.current.on('reconnect_attempt', () => {
        setStatus('reconnecting');
      });

      // Connection error
      socketRef.current.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(err.message);
        reconnect();
      });

      // Reconnection failed
      socketRef.current.on('reconnect_failed', () => {
        reconnect();
      });

      setStatus('connected');
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      setError('Failed to initialize WebSocket connection');
      setStatus('error');
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [reconnect]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      // Device came back online, try to reconnect
      retriesRef.current = 0;
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      setStatus('disconnected');
      setError('Device is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    socket: socketRef.current,
    status,
    reconnect,
    error,
  };
}
