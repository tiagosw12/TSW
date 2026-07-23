import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface DataRefreshContextValue {
  version: number;
  bump: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextValue | null>(null);

/**
 * Cross-tab "something changed" signal. Quick actions in the Adicionar sheet
 * can be triggered from any tab, so a plain callback prop can't reach the
 * screen that needs to refetch — bumping this version is what lets Home's
 * queue (and the Calendar's projection) pick up a session/quiz logged while
 * looking at another tab, without a route remount.
 */
export function DataRefreshProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  return <DataRefreshContext.Provider value={{ version, bump }}>{children}</DataRefreshContext.Provider>;
}

export function useDataRefresh() {
  const ctx = useContext(DataRefreshContext);
  if (!ctx) throw new Error("useDataRefresh must be used within DataRefreshProvider");
  return ctx;
}
