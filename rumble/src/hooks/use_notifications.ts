import { useState } from "react";

export function useNotifications(): NotificationData {
  const [text, setText] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"success" | "error" | undefined>(undefined);

  const notify = (text: string, type: "success" | "error") => {
    setText(text);
    setType(type);
  };

  return {
    text,
    type,
    notify,
    clear: () => {
      setText(undefined);
    },
  };
}

export interface NotificationData {
  text?: string;
  type?: "success" | "error";
  notify: (text: string, type: "success" | "error") => void;
  clear: () => void;
}
