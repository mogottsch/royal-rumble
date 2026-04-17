import Echo from "laravel-echo";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function useEcho() {
  const [echo, setEcho] = useState<Echo<"pusher">>();

  useEffect(() => {
    const scheme = import.meta.env.VITE_PUSHER_SCHEME ?? "http";
    const forceTLS = scheme === "https";
    const rawHost = import.meta.env.VITE_PUSHER_HOST ?? window.location.hostname;
    const [wsHost, embeddedPort] = rawHost.split(":");
    const port = Number(
      import.meta.env.VITE_PUSHER_PORT ?? embeddedPort ?? (forceTLS ? 443 : 80),
    );
    window.Pusher = Pusher;
    let laravelEcho = new Echo<"pusher">({
      broadcaster: "pusher",
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      wsHost,
      wsPort: port,
      wssPort: port,
      cluster: "mt1",
      forceTLS,
      encrypted: true,
      disableStats: true,
      enabledTransports: forceTLS ? ["wss"] : ["ws"],
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
