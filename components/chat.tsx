// Chat.tsx
'use client';

// import { Model } from '@/lib/types/models';
import { useChatWS } from '@/lib/websocket/use-chatws'; // adjust the path as needed
import { Message } from 'ai';
import { useEffect } from 'react';
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
    error
  } = useChatWS({
    url: 'wss://xi-development.flowfuse.cloud/morphic',
    id,
    initialMessages: savedMessages
  });

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

  return (
    <div className="flex flex-col w-full max-w-3xl pt-14 pb-60 mx-auto stretch">
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
