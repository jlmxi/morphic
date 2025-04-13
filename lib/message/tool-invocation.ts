/**
 * Typed tool call returned by functions such as generateText or streamText.
 * It contains the tool call ID, the tool name, and the tool arguments.
 */
 export interface ToolCall<NAME extends string, ARGS> {
    /** The unique ID of the tool call used for matching with its result. */
    toolCallId: string;
    /** The name of the tool that is being called. */
    toolName: NAME;
    /** JSON-serializable arguments that match the tool's input schema. */
    args: ARGS;
  }
  
  /**
   * Typed tool result that is returned from tool executions.
   * It contains the tool call ID, the tool name, the tool arguments, and the tool result.
   */
  export interface ToolResult<NAME extends string, ARGS, RESULT> {
    /** The unique ID of the tool call used for matching with its result. */
    toolCallId: string;
    /** The name of the tool that was called. */
    toolName: NAME;
    /** JSON-serializable arguments that match the tool's input schema. */
    args: ARGS;
    /** The result of the tool's execution. */
    result: RESULT;
  }
  
  /**
   * A union type representing the state of a tool invocation.
   */
  export type ToolInvocation =
    | ({ state: 'partial-call'; step?: number } & ToolCall<string, any>)
    | ({ state: 'call'; step?: number } & ToolCall<string, any>)
    | ({ state: 'result'; step?: number } & ToolResult<string, any, any>);
  