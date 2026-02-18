import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  path: string;
}

interface NavContextType {
  crumbs: Crumb[];
  setCrumbs: (crumbs: Crumb[]) => void;
  clearCrumbs: () => void;
}

const NavigationContext = createContext<NavContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  const clearCrumbs = () => setCrumbs([]);

  return (
    <NavigationContext.Provider value={{ crumbs, setCrumbs, clearCrumbs }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used inside provider");
  return context;
}
