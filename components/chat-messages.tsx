import type { Message } from '@/lib/message';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RenderMessage } from './render-message';
import { Spinner } from './ui/spinner';

interface MessageGroup {
  groupId: string;
  messages: Message[];
}

interface ChatMessagesProps {
  messages: Message[];
  onQuerySelect: (query: string) => void;
  isLoading: boolean;
  chatId?: string;
}

export function ChatMessages({
  messages,
  onQuerySelect,
  isLoading,
  chatId,
}: ChatMessagesProps) {
  console.log('Initial messages:', messages);

  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  // Compute groups from the flat messages array by grouping on message.groupId.
  // If a message doesn't have a groupId, we fall back to its id.
  const groups: MessageGroup[] = useMemo(() => {
    const groupMap: Record<string, Message[]> = {};
    messages.forEach((msg) => {
      const groupId = msg.groupId || msg.id;
      if (!groupMap[groupId]) {
        groupMap[groupId] = [];
      }
      groupMap[groupId].push(msg);
    });
    // Preserve the order based on the messages array order.
    return Object.keys(groupMap).map((groupId) => ({
      groupId,
      messages: groupMap[groupId],
    }));
  }, [messages]);

  // Ref for the scroll container.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to a specific group (by id)
  const scrollToGroup = (groupId: string) => {
    const el = document.getElementById(groupId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // When groups change, scroll to the target group.
  // If the first message in the new group has a refUserMessageId,
  // scroll to that group's container; otherwise, scroll to the new group.
  useEffect(() => {
    if (groups.length > 0) {
      const newGroup = groups[groups.length - 1];
      const refMessageId = newGroup.messages[0]?.refMessageId;
      const targetGroupId = refMessageId || newGroup.groupId;
      scrollToGroup(targetGroupId);
    }
  }, [groups]);

  useEffect(() => {
    console.log('Group IDs:', groups.map((group) => group.groupId));
  }, [groups]);

  if (!messages.length) return null;

  const showLoading =
    isLoading && messages[messages.length - 1].role === 'user';

  // Returns whether a group is open; by default, only the newest group is open.
  // TODO: maybe refMessageId group should be open too?
  const getIsOpen = (messageId: string) => {
    // Find the group that contains the message with this id.
    const group = groups.find((g) =>
      g.messages.some((msg) => msg.id === messageId)
    );
    if (!group) return false;
    const index = groups.findIndex((g) => g.groupId === group.groupId);
    // Default to open if this is the newest group.
    return openStates[group.groupId] ?? (index === groups.length - 1);
  };

  const handleOpenChange = (messageId: string, open: boolean) => {
    setOpenStates(prev => ({
      ...prev,
      [messageId]: open,
    }));
  };

  return (
    <div className="relative mx-auto px-4 w-full">
      {groups.map((group) => (
        <div key={group.groupId} id={group.groupId} className="mb-4 flex flex-col gap-4">
          {group.messages.map((message) => (
            <RenderMessage
              key={message.id}
              message={message}
              getIsOpen={getIsOpen}
              onOpenChange={handleOpenChange}
              onQuerySelect={onQuerySelect}
              chatId={chatId}
            />
          ))}
        </div>
      ))}
      {showLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      <div ref={messagesEndRef} /> {/* Optional scroll anchor */}
    </div>
  );
}
