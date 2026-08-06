import { useCallback, useMemo, useState } from "react";

export function useNotifications(): NotificationData {
  const [text, setText] = useState<string>();
  const [type, setType] = useState<"success" | "error">();
  const notify = useCallback((nextText: string, nextType: "success" | "error") => {
    setText(nextText);
    setType(nextType);
  }, []);
  const clear = useCallback(() => setText(undefined), []);

  return useMemo(() => ({ text, type, notify, clear }), [clear, notify, text, type]);
}

export interface NotificationData {
  text?: string;
  type?: "success" | "error";
  notify: (text: string, type: "success" | "error") => void;
  clear: () => void;
}
