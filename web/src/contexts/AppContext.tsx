"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle";
  description: string;
  model: string;
}

interface AppContextType {
  agents: Agent[];
  loading: boolean;
  setAgents: (agents: Agent[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "rig-orchestrator",
      name: "RIG Orchestrator",
      role: "Mission Coordinator",
      status: "active",
      description: "Routes tasks to specialist agents (Scout, Scribe, Reach, Dev)",
      model: "openrouter/free",
    },
    {
      id: "rig-scout",
      name: "Scout",
      role: "Research Specialist",
      status: "idle",
      description: "Information gathering and analysis",
      model: "kilo-auto/free",
    },
    {
      id: "rig-scribe",
      name: "Scribe",
      role: "Content Creator",
      status: "idle",
      description: "Documentation and content writing",
      model: "openrouter/free",
    },
    {
      id: "rig-reach",
      name: "Reach",
      role: "Marketing Growth",
      status: "idle",
      description: "Audience expansion and engagement",
      model: "openrouter/free",
    },
    {
      id: "rig-dev",
      name: "Dev",
      role: "Engineering",
      status: "idle",
      description: "Code development and system integration",
      model: "openrouter/free",
    },
    {
      id: "crewai-manager",
      name: "CrewAI Manager",
      role: "Workflow Coordinator",
      status: "idle",
      description: "Coordinates sequential tasks across agents",
      model: "openrouter/free",
    },
    {
      id: "crewai-worker",
      name: "CrewAI Worker",
      role: "Task Executor",
      status: "idle",
      description: "Executes assigned workflows",
      model: "openrouter/free",
    },
    {
      id: "crewai-validator",
      name: "CrewAI Validator",
      role: "Quality Assurance",
      status: "idle",
      description: "Validates outputs against criteria",
      model: "openrouter/free",
    },
  ]);
  return (
    <AppContext.Provider value={{ agents, loading: false, setAgents }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}