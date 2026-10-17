import type { ComponentType } from "react";
import {
  IconActivity,
  IconBolt,
  IconChartBar,
  IconClock,
  IconCode,
  IconCpu,
  IconDatabase,
  IconEye,
  IconFileText,
  IconFolder,
  IconHeart,
  IconKey,
  IconMessageCircle,
  IconPackage,
  IconPuzzle,
  IconSettings,
  IconShield,
  IconSparkles,
  IconStar,
  IconTerminal,
  IconTool,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";

export type PluginIconComponent = ComponentType<{ className?: string }>;

/**
 * Plugin manifests name their icon with a plain string, so these keys are a
 * public contract: third-party plugins ship `icon: "BarChart3"` and we cannot
 * rename them without breaking every installed plugin. The Tabler component
 * behind each key is ours to swap — that is the whole point of the migration.
 *
 * Add new keys for plugin authors as needed; never rename an existing one.
 */
const PLUGIN_ICON_MAP: Record<string, PluginIconComponent> = {
  Activity: IconActivity,
  BarChart3: IconChartBar,
  Clock: IconClock,
  Cpu: IconCpu,
  FileText: IconFileText,
  FolderOpen: IconFolder,
  KeyRound: IconKey,
  MessageSquare: IconMessageCircle,
  Package: IconPackage,
  Settings: IconSettings,
  Puzzle: IconPuzzle,
  Sparkles: IconSparkles,
  Terminal: IconTerminal,
  Globe: IconWorld,
  Database: IconDatabase,
  Shield: IconShield,
  Users: IconUsers,
  Wrench: IconTool,
  Zap: IconBolt,
  Heart: IconHeart,
  Star: IconStar,
  Code: IconCode,
  Eye: IconEye,
};

export const FALLBACK_PLUGIN_ICON: PluginIconComponent = IconPuzzle;

export function resolvePluginIcon(name: string): PluginIconComponent {
  return PLUGIN_ICON_MAP[name] ?? FALLBACK_PLUGIN_ICON;
}