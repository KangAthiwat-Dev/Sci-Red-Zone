"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

const InteractionLockContext =
  createContext(false);

type InteractionLockProviderProps = {
  locked: boolean;
  children: ReactNode;
};

export function InteractionLockProvider({
  locked,
  children,
}: InteractionLockProviderProps) {
  return (
    <InteractionLockContext.Provider
      value={locked}
    >
      {children}
    </InteractionLockContext.Provider>
  );
}

export function useInteractionLocked() {
  return useContext(
    InteractionLockContext,
  );
}