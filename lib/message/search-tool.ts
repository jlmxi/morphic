/**
 * Arguments for the search tool.
 */
 export interface SearchToolArgs {
    query: string;
    max_results: number;
    search_depth: string;
  }
  
  /**
   * An image result from the search tool.
   */
  export interface SearchToolResultImage {
    url: string;
    description: string;
  }
  
  /**
   * A single result item from the search tool.
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
  