import { describe, expect, it } from "vitest";
import type { Preset } from "$lib/db/types";
import { presetSortKey, sortPresets } from "./presets";

describe("presetSortKey", () => {
  it("uses the first word that starts with a letter", () => {
    expect(presetSortKey("2x Yogurt")).toBe("Yogurt");
    expect(presetSortKey("1 Protein shake")).toBe("Protein");
  });

  it("uses the first word when description starts with a letter", () => {
    expect(presetSortKey("Greek yogurt")).toBe("Greek");
  });
});

describe("sortPresets", () => {
  it("sorts by first letter word alphabetically", () => {
    const presets: Preset[] = [
      { id: "p1", description: "2x Yogurt", grams: 15 },
      { id: "p2", description: "1 Protein shake", grams: 30 },
      { id: "p3", description: "Greek yogurt", grams: 20 },
    ];

    expect(sortPresets(presets).map((p) => p.description)).toEqual([
      "Greek yogurt",
      "1 Protein shake",
      "2x Yogurt",
    ]);
  });
});
