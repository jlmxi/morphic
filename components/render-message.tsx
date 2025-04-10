import { Message } from '@/lib/message';
import { AnswerSection } from './answer-section';
import { ToolSection } from './tool-section';
import { UserMessage } from './user-message';

interface RenderMessageProps {
  message: Message;
  getIsOpen: (id: string) => boolean;
  onOpenChange: (id: string, open: boolean) => void;
  onQuerySelect: (query: string) => void;
  chatId?: string;
}

export function RenderMessage({
  message,
  getIsOpen,
  onOpenChange,
  onQuerySelect,
  chatId,
}: RenderMessageProps) {

  // For a user message, content conatins the message text:
  // from chat-panel.tsx
    // if query is not empty, submit the query
    // useEffect(() => {
    //   if (isFirstRender.current && query && query.trim().length > 0) {
    //     append({
    //       role: 'user',
    //       content: query
    //     })
    //     isFirstRender.current = false
    //   }
    // }, [query])  
  if (message.role === 'user') {
    return <UserMessage message={message.content} />;
  }

  if (message.role === 'assistant') {
    if (message.content.type === 'text') {
      return (
        <AnswerSection
          content={message.content.text}
          isOpen={getIsOpen(message.id)}
          onOpenChange={(open) => onOpenChange(message.id, open)}
          chatId={chatId}
        />
      );
    }
  }

  if (message.role === 'tool') {
    if (message.content.type === 'tool-call') {
      return (
        <ToolSection
          tool={{
            toolCallId: message.content.toolCallId,
            toolName: message.content.toolName,
            args: message.content.args || {},
            state: 'call',
          }}
          isOpen={getIsOpen(message.id)}
          onOpenChange={(open) => onOpenChange(message.id, open)}
        />
      );
    }
    if (message.content.type === 'tool-result') {
      return (
        <ToolSection
          tool={{
            toolCallId: message.content.toolCallId,
            toolName: message.content.toolName,
            args: message.content.args || {},
            result: message.content.result,
            state: 'result',
          }}
          isOpen={getIsOpen(message.id)}
          onOpenChange={(open) => onOpenChange(message.id, open)}
        />
      );
    }
  }

  // Fallback: render nothing if format is not supported.
  return null;
}
