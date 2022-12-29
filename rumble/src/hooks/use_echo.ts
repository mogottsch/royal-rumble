import Echo from "laravel-echo";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function useEcho() {
  const [echo, setEcho] = useState<Echo>();

  useEffect(() => {
    window.Pusher = Pusher;
    let laravelEcho = new Echo({
      broadcaster: "pusher",
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      wsHost: import.meta.env.VITE_PUSHER_HOST,
      wsPort: import.meta.env.VITE_PUSHER_PORT,
      wssPort: import.meta.env.VITE_PUSHER_PORT,
      cluster: "mt1",
      forceTLS: false,
      encrypted: true,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
    });
    setEcho(laravelEcho);
  }, []);

  return echo;
}

declare global {
  interface Window {
    Pusher: any;
  }
}
