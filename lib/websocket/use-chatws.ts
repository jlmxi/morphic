import type { Message } from '@/lib/message';
import { generateId as generateIdFunc } from '@/lib/utils/generate-id';
import { useEffect, useRef, useState } from 'react';
import { WebSocketManager } from './websocket-manager';

interface UseChatWSOptions {
  url: string;           // The WebSocket URL
  id?: string;           // Chat id for the session, optional
  initialMessages?: Message[];
}

// Global map for reusing WebSocketManager instances by URL.
const wsManagers: Record<string, WebSocketManager> = {};

export function useChatWS({ url, id, initialMessages = [] }: UseChatWSOptions) {
  // Generate an id if none is provided.
  const [hookId] = useState(() => id || generateIdFunc());
  const chatId = id ?? hookId;

  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages.map((msg) => ({ ...msg, groupId: msg.groupId || msg.id }))
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to store the shared WebSocketManager instance.
  const wsRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    // If a WebSocketManager for this URL doesn't exist, create one.
    if (!wsManagers[url]) {
      wsManagers[url] = new WebSocketManager(url);
      console.log("Created new WS for URL:", url);
    } else {
      console.log("Reusing WS for URL:", url);
    }
    wsRef.current = wsManagers[url];
    const ws = wsRef.current;

    // Define your message handler.
    const messageHandler = (data: any) => {
      let newMessages: Message[] = [];
      if (Array.isArray(data)) {
        // Use the id of the first message as the groupId.
        const groupId = data[0]?.id;
        newMessages = data.map((msg: Message) => ({
          ...msg,
          groupId,
        }));
      } else {
        newMessages = [{ ...data, groupId: data.id }];
      }
      // Update the flat messages array:
      setMessages((prev) => {
        const updated = [...prev];
        newMessages.forEach((newMsg) => {
          const idx = updated.findIndex((m) => m.id === newMsg.id);
          if (idx !== -1) {
            updated[idx] = newMsg;
          } else {
            updated.push(newMsg);
          }
        });
        return updated;
      });
      setIsLoading(false);
    };

    // Add the message handler to our shared WebSocket.
    ws.addMessageHandler(messageHandler);

    // Define an error handler.
    const errorHandler = (err: any) => {
      console.error("WebSocket encountered an error", err);
      setError(new Error("WebSocket error"));
      setIsLoading(false);
    };
    ws.addErrorHandler(errorHandler);

    // Do not disconnect the WebSocket on unmount since we want it to be reused.
    // Optionally, you could remove your handlers here if your WebSocketManager supports it.
    return () => {
      // For a robust solution, you might want to remove this handler from ws here.
      // For now, we leave it so that the global WS persists.
    };
  }, [url]);

  // Append a message and send it over the WebSocket.
  // Here we treat a new user message as its own group.
  const append = (message: Message) => {
    const msgWithGroup = { ...message, groupId: message.id };
    setMessages((prev) => [...prev, msgWithGroup]);
    if (wsRef.current) {
      wsRef.current.send({ type: 'message', payload: msgWithGroup, chatId });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  // Dummy stop implementation.
  const stop = () => {
    if (wsRef.current) {
      wsRef.current.send({ type: 'stop', chatId });
      setIsLoading(false);
    }
  };

  // Simple reload: remove last assistant message and send a reload command.
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
    setMessages, // Exposed for external updates.
    append,
    handleInputChange,
    handleSubmit,
    stop,
    reload,
    setInput,
  };
}
