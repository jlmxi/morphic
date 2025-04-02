import { generateId as generateIdFunc } from '@ai-sdk/ui-utils'; // or your custom id generator
import type { Message } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { WebSocketManager } from './websocket-manager';

interface UseChatWSOptions {
  url: string;           // The WebSocket URL (e.g. "wss://your-backend.example.com/chat")
  id?: string;           // Chat id for the session, optional now
  initialMessages?: Message[];
}

export function useChatWS({ url, id, initialMessages = [] }: UseChatWSOptions) {
  // Generate an id if none is provided
  const [hookId] = useState(() => id || generateIdFunc());
  const chatId = id ?? hookId;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store our WebSocketManager instance in a ref so it persists across renders
  const wsRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    // Initialize the connection
    wsRef.current = new WebSocketManager(url);
    const ws = wsRef.current;

    // Listen for incoming messages from the backend.
    ws.addMessageHandler((data: any) => {
      if (data.type === 'message') {
        // Append the incoming message (which might be from the assistant)
        setMessages((prev) => [...prev, data.payload]);
        setIsLoading(false);
      }
      // Handle other types of messages (e.g. updates, tool calls) as needed.
    });

    ws.addErrorHandler((err: any) => {
      console.error("WebSocket encountered an error", err);
      setError(new Error("WebSocket error"));
      setIsLoading(false);
    });

    return () => {
      // Clean up the connection when the component using the hook unmounts.
      ws.disconnect();
    };
  }, [url]);

  // Append a message and send it over the WebSocket
  const append = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    if (wsRef.current) {
      wsRef.current.send({ type: 'message', payload: message, chatId });
    }
  };

  // Submit a new chat message from the user.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setIsLoading(true);
    append(userMessage);
    setInput('');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(e.target.value);
  };

  // A dummy stop implementation – you might want to send a “stop” command over the WS.
  const stop = () => {
    if (wsRef.current) {
      wsRef.current.send({ type: 'stop', chatId });
      setIsLoading(false);
    }
  };

  // A simple reload function that might, for instance, request the server to re-send the last reply.
  const reload = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      setMessages((prev) => prev.slice(0, -1));
      if (wsRef.current) {
        wsRef.current.send({ type: 'reload', chatId });
        setIsLoading(true);
      }
    }
  };

  return {
    id: chatId,
    messages,
    input,
    isLoading,
    error,
    setMessages, // Exposed in case you need to update messages externally
    append,
    handleInputChange,
    handleSubmit,
    stop,
    reload,
    setInput,
  };
}
