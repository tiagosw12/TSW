import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";
import { AddSheet } from "../screens/AddSheet";
import { DataRefreshProvider } from "../contexts/DataRefreshContext";

export function AppShell() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DataRefreshProvider>
      <Outlet />
      <TabBar onAddClick={() => setAddOpen(true)} />
      {addOpen && <AddSheet onClose={() => setAddOpen(false)} />}
    </DataRefreshProvider>
  );
}
