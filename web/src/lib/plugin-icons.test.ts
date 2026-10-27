import { describe, expect, it } from "vitest";
import {
  FALLBACK_PLUGIN_ICON,
  resolvePluginIcon,
} from "@/lib/plugin-icons";

/**
 * Plugin manifests name their icon with a bare string, so these keys are a
 * public contract. These assertions pin that contract: a rename here silently
 * renders the fallback puzzle for every already-installed plugin instead of
 * failing a build.
 */
describe("resolvePluginIcon", () => {
  it("resolves every documented plugin icon name to a real component", () => {
    const names = [
      "Activity",
      "BarChart3",
      "Clock",
      "Cpu",
      "FileText",
      "FolderOpen",
      "KeyRound",
      "MessageSquare",
      "Package",
      "Settings",
      "Puzzle",
      "Sparkles",
      "Terminal",
      "Globe",
      "Database",
      "Shield",
      "Users",
      "Wrench",
      "Zap",
      "Heart",
      "Star",
      "Code",
      "Eye",
    ];

    for (const name of names) {
      const icon = resolvePluginIcon(name);
      expect(icon, `plugin icon "${name}" must resolve`).toBeDefined();
      expect(icon, `plugin icon "${name}" must be a component`).toHaveProperty(
        "render",
      );
    }
  });

  it("resolves each documented name to a distinct component", () => {
    // A copy-paste slip in the map (two keys pointing at one component) is
    // invisible at runtime but quietly collapses the plugin icon vocabulary.
    const names = [
      "Activity",
      "BarChart3",
      "Clock",
      "Cpu",
      "FileText",
      "FolderOpen",
      "KeyRound",
      "MessageSquare",
      "Package",
      "Settings",
      "Sparkles",
      "Terminal",
      "Globe",
      "Database",
      "Shield",
      "Users",
      "Wrench",
      "Zap",
      "Heart",
      "Star",
      "Code",
      "Eye",
    ];

    const resolved = names.map((n) => resolvePluginIcon(n));
    expect(new Set(resolved).size).toBe(names.length);
  });

  it("falls back rather than throwing on an unknown name", () => {
    expect(resolvePluginIcon("NoSuchLucideIcon")).toBe(FALLBACK_PLUGIN_ICON);
    expect(resolvePluginIcon("")).toBe(FALLBACK_PLUGIN_ICON);
  });

  it("accepts the className prop the sidebar passes", () => {
    // The sidebar sizes every nav icon through `className`; a component that
    // dropped the prop would render unsized and break the rail.
    expect(resolvePluginIcon("Activity")).toBeTypeOf("object");
    expect(resolvePluginIcon("Activity")).toHaveProperty("render");
  });
});