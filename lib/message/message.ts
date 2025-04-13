import type { JSONValue } from './common';
import type { SearchToolArgs, SearchToolResult } from './search-tool';

/**
 * A base interface for all messages.
 */
export interface BaseMessage {
  /** A unique identifier for the message. */
  id: string;
  /** The role of the message. */
  role: 'user' | 'assistant' | 'tool';
  /** The creation timestamp. */
  createdAt?: Date;
  /** The group identifier for grouping related messages. */
  groupId?: string;
  /**
   * Reference to another message that this message is responding to.
   * If not provided, the message may be considered standalone.
   */
  refMessageId?: string;
}

/**
 * A user message where content is simply a string.
 */
export interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
}

/**
 * An assistant message with structured text content.
 */
export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
  annotations?: JSONValue[];
}

/**
 * A tool message that contains tool invocation details or results.
 */
export interface ToolMessage extends BaseMessage {
  role: 'tool';
  content: {
    type: 'tool-call' | 'tool-result';
    toolCallId: string;
    toolName: string; // Optionally, use a union type if you have multiple tool names.
    args?: SearchToolArgs;
    result: SearchToolResult;
  };
}

/**
 * The overall Message type as a union of all possible messages.
 */
export type Message = UserMessage | AssistantMessage | ToolMessage;
