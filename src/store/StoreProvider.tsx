"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";

export default function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser: the store is created exactly once per client.
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
