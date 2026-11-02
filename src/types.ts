export type AssistantState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  action?: {
    type: string;
    param?: string | null;
  } | null;
}

export interface AndroidFile {
  path: string;
  size: number;
  content: string;
  isText: boolean;
}
