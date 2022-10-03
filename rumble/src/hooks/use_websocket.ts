import { useEffect, useRef } from "react";

export function useWebsocket() {
  // const url = new URL("ws://localhost:8080/ws");
  const url = new URL("ws://localhost:8095/ws");

  const cRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const c = new WebSocket(url);

    const send = function (data: Parameters<WebSocket["send"]>[0]) {
      console.log({ data });
      c.send(data);
    };

    c.onmessage = function (msg) {
      console.log({ msg });
      console.log(msg);
    };

    c.onopen = function () {
      setInterval(function () {
        send("ping");
      }, 1000);
    };

    return function () {
      c.close();
    };
  }, []);
  return { send: cRef.current?.send };
}
