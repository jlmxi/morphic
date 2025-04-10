/**
 * A base interface for all messages.
 */
 export interface BaseMessage {
  /**
   * A unique identifier for the message.
   */
  id: string;
  /**
   * The role of the message.
   */
  role: 'user' | 'assistant' | 'tool';
  /**
   * The creation timestamp.
   */
  createdAt?: Date;
  /**
   * The group identifier for grouping related messages.
   */
  groupId?: string;
    /**
   * A reference to the a message that this message is responding to, most likely a user message.
   * If not provided, the message may be considered standalone.
   */
  refMessageId?: string;
}

/**
 * A user message. Content is simply a string.
 */
export interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
}

/**
 * An assistant message. Content is an object with a type ("text") and a text field.
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
 * Arguments for the search tool.
 */
export interface SearchToolArgs {
  query: string;
  max_results: number;
  search_depth: string;
}

/**
 * An image in the search tool result.
 */
export interface SearchToolResultImage {
  url: string;
  description: string;
}

/**
 * A single result item in the search tool result.
 */
export interface SearchToolResultItem {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content: string | null;
}

/**
 * The complete result returned by the search tool.
 */
export interface SearchToolResult {
  query: string;
  follow_up_questions: string | null;
  answer: string | null;
  images: SearchToolResultImage[];
  results: SearchToolResultItem[];
  response_time: number;
}

/**
 * A tool message. Content is an object with type "tool-result" and includes tool details.
 */
export interface ToolMessage extends BaseMessage {
  role: 'tool';
  content: {
    type: 'tool-call' | 'tool-result';
    toolCallId: string;
    toolName: any; // Expand to a union if you have more tool types.
    args?: SearchToolArgs;
    result: SearchToolResult;
  };
}

/**
 * The overall Message type is a union of the above.
 */
export type Message = UserMessage | AssistantMessage | ToolMessage;

/**
 * A JSON value can be a string, number, boolean, object, array, or null.
 */
export type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [key: string]: JSONValue }
  | JSONValue[];

export type ToolInvocation =
  | ({ state: 'partial-call'; step?: number } & ToolCall<string, any>)
  | ({ state: 'call'; step?: number } & ToolCall<string, any>)
  | ({ state: 'result'; step?: number } & ToolResult<string, any, any>);

/**
Typed tool call that is returned by generateText and streamText.
It contains the tool call ID, the tool name, and the tool arguments.
 */
export interface ToolCall<NAME extends string, ARGS> {
  /**
ID of the tool call. This ID is used to match the tool call with the tool result.
 */
  toolCallId: string;

  /**
Name of the tool that is being called.
 */
  toolName: NAME;

  /**
Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
   */
  args: ARGS;
}

/**
Typed tool result that is returned by `generateText` and `streamText`.
It contains the tool call ID, the tool name, the tool arguments, and the tool result.
 */
export interface ToolResult<NAME extends string, ARGS, RESULT> {
  /**
ID of the tool call. This ID is used to match the tool call with the tool result.
   */
  toolCallId: string;

  /**
Name of the tool that was called.
   */
  toolName: NAME;

  /**
Arguments of the tool call. This is a JSON-serializable object that matches the tool's input schema.
     */
  args: ARGS;

  /**
Result of the tool call. This is the result of the tool's execution.
     */
  result: RESULT;
}
