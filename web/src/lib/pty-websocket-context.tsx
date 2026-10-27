import { createContext, useContext } from "react";

interface PtyWebSocketContextValue {
  ws: WebSocket | null;
}

const PtyWebSocketContext = createContext<PtyWebSocketContextValue | null>(null);

export function PtyWebSocketProvider({
  children,
  ws,
}: {
  children: React.ReactNode;
  ws: WebSocket | null;
}) {
  return (
    <PtyWebSocketContext.Provider value={{ ws }}>
      {children}
    </PtyWebSocketContext.Provider>
  );
}

export function usePtyWebSocket(): WebSocket | null {
  const context = useContext(PtyWebSocketContext);
  if (!context) {
    return null;
  }
  return context.ws;
}