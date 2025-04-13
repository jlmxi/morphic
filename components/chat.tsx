// Chat.tsx
'use client';

import { Message } from '@/lib/message';
import { EventBridge } from '@/lib/utils';
import { useChatWS } from '@/lib/websocket/use-chatws';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChatMessages } from './chat-messages';
import { ChatPanel } from './chat-panel';

export function Chat({
  id,
  savedMessages = [],
  query
}: {
  id: string;
  savedMessages?: Message[];
  query?: string;
}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    stop,
    append,
    setInput,
    sendMessage,
    error
  } = useChatWS({
    url: 'wss://xi-development.flowfuse.cloud/morphic',
    id,
    initialMessages: savedMessages
  });

  // Local state to store configuration or session data if needed
  const [config, setConfig] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Initialize EventBridge and listen for events from the xi-controller.
  useEffect(() => {
    // Instantiate EventBridge with an id unique for this chat widget (using the chat component's id)
    const eventBridge = new EventBridge("chat");

    eventBridge.on('xi-config', (configData: any) => {
      console.log('[Chat] Received xi-config:', configData);
      // Update state or perform any initialization using the config data.
      setConfig(configData);
    });

    eventBridge.on('xi-session', (sessionId: string) => {
      console.log('[Chat] Received xi-session:', sessionId);
      // Extract and update the session id.
      setSessionId(sessionId);
    });

    return () => {
      eventBridge.dispose();
    };
  }, [id]);
  
  useEffect(() => {
    setMessages(savedMessages);
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(`Error in chat: ${error.message}`);
    }
  }, [error]);

  const onQuerySelect = (query: string) => {
    append({
      id: `${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date(),
    });
  };

  // Send a system "init" message once both config and sessionId are available.
  useEffect(() => {
    console.log('[Chat] sendMessage config:', config);
    console.log('[Chat] sendMessage sessionId:', sessionId);
    if (config && sessionId) {
      const content = {
        type: 'init',
        sessionId,                     // sessionId from state
        client: config.client,         // client from config
        clientId: config.clientId      // clientId from config
      };
      sendMessage('init', 'system', content);
    }
  }, [config, sessionId, sendMessage]);
  
  // Only render the chat UI after both config and sessionId are available.
  if (!config || !sessionId) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Loading chat widget...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch">
      <div className="mb-4 text-sm text-gray-600">
        Session ID: <span className="font-mono">{sessionId}</span>
      </div>
      
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onQuerySelect={onQuerySelect}
        chatId={id}
      />
      <ChatPanel
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        stop={stop}
        query={query}
        append={append}
      />
    </div>
  );
}
