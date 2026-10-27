# Project Summary: The Hermes Rig

**Project Name:** Hermes Rig (Core Orchestration Engine for `hermes-agent`)

## 🌌 Vision
The Hermes Rig is a high-performance, durable AI agent organization designed to eliminate "context collapse" and "hallucinated progress" in autonomous software engineering. It transforms LLMs from simple chat-bots into a coordinated mesh of specialist agents capable of executing complex, multi-step technical missions with programmatic verification.

## 🏗 Architectural Pillars

### 1. Durable State (The Workspace)
Unlike standard agents that rely on volatile chat history, the Rig uses a **filesystem-based state machine** (`.openrig/workspace/`). 
- **Missions**: High-level goals recorded as permanent records.
- **Slices**: Atomic, verifiable units of work with explicit `SPEC.md` files and `artifact.diff` outputs.
- **Result**: Zero context loss across sessions; any agent can resume a mission by reading the workspace.

### 2. Two-Tiered Intelligence (System 1 & 2)
- **System 1 (Reflex Router)**: A sub-500ms routing layer that instantly directs simple tasks to the correct seat using confidence gating.
- **System 2 (Deep Slicer)**: An architectural reasoning engine that decomposes complex goals into a dependency graph of verifiable Slices.

### 3. The Specialist Mesh (CrewAI Powered)
The Rig replaces monolithic prompts with a **role-playing mesh** of experts:
- **The Slicer (Manager)**: Decomposes goals and assigns tasks.
- **The Builder**: Implements code changes and generates diffs.
- **The Critic**: Performs security audits and quality gating; must approve work before it is marked `completed`.
- **The Librarian**: Handles codebase navigation and high-fidelity context retrieval via Gortex.
- **The Operator**: Manages the physical environment (tmux, shell, files).

### 4. Physical Tool Bridge
A restricted, project-rooted interface that allows agents to execute real Bash commands, read/write files, and communicate across tmux sessions, ensuring the agents are driving the actual codebase, not just simulating it.

## 🚀 Current Status
- **Core Logic**: Implemented (Router, Workspace, Slicer, Tool Bridge).
- **Infrastructure**: Stabilized (tmux-native bootloader, Gortex indexing).
- **Integration Phase**: Currently migrating from manual polling loops to **CrewAI**, enabling hierarchical task separation and autonomous collaboration.

## 🏁 The Goal
A "one-command" engineering experience: `hermes rig run "Implement OAuth2 with GitHub"` $\rightarrow$ **Slicing** $\rightarrow$ **Collaborative Execution** $\rightarrow$ **Verification** $\rightarrow$ **Merged PR**.
