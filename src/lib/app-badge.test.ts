import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { remainingGoalGrams, setAppBadgeGrams, syncTodayAppBadge } from "./app-badge";

vi.mock("$lib/db/day-repository", () => ({
  getDay: vi.fn(),
}));

import * as dayRepository from "$lib/db/day-repository";

describe("setAppBadgeGrams", () => {
  const setAppBadge = vi.fn().mockResolvedValue(undefined);
  const clearAppBadge = vi.fn().mockResolvedValue(undefined);
  const requestPermission = vi.fn().mockResolvedValue("granted");

  beforeEach(() => {
    vi.stubGlobal("navigator", { setAppBadge, clearAppBadge });
    vi.stubGlobal("Notification", { permission: "granted", requestPermission });
    setAppBadge.mockClear();
    clearAppBadge.mockClear();
    requestPermission.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets badge when grams are logged", async () => {
    await setAppBadgeGrams(42);
    expect(setAppBadge).toHaveBeenCalledWith(42);
  });

  it("clears badge when no grams are logged", async () => {
    await setAppBadgeGrams(0);
    expect(clearAppBadge).toHaveBeenCalled();
  });

  it("requests permission before setting a non-zero badge", async () => {
    vi.stubGlobal("Notification", { permission: "default", requestPermission });
    await setAppBadgeGrams(25);
    expect(requestPermission).toHaveBeenCalled();
    expect(setAppBadge).toHaveBeenCalledWith(25);
  });

  it("does nothing when the Badging API is unavailable", async () => {
    vi.stubGlobal("navigator", {});
    await setAppBadgeGrams(10);
    expect(setAppBadge).not.toHaveBeenCalled();
  });

  it("does nothing when notification permission is denied", async () => {
    vi.stubGlobal("Notification", { permission: "denied", requestPermission });
    await setAppBadgeGrams(10);
    expect(setAppBadge).not.toHaveBeenCalled();
  });
});

describe("remainingGoalGrams", () => {
  it("returns remaining grams until goal", () => {
    expect(remainingGoalGrams(150, 42)).toBe(108);
  });

  it("returns zero when goal is reached", () => {
    expect(remainingGoalGrams(150, 150)).toBe(0);
  });

  it("returns zero when intake exceeds goal", () => {
    expect(remainingGoalGrams(150, 160)).toBe(0);
  });
});

describe("syncTodayAppBadge", () => {
  const setAppBadge = vi.fn().mockResolvedValue(undefined);
  const clearAppBadge = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.stubGlobal("navigator", { setAppBadge, clearAppBadge });
    vi.stubGlobal("Notification", { permission: "granted" });
    vi.mocked(dayRepository.getDay).mockReset();
    setAppBadge.mockClear();
    clearAppBadge.mockClear();
  });

  it("shows remaining grams until goal is reached", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      _id: "day:2026-06-12",
      date: "2026-06-12",
      goalGrams: 150,
      intakes: [{ id: "1", time: "08:00", description: "Shake", grams: 42 }],
    });

    await syncTodayAppBadge();
    expect(setAppBadge).toHaveBeenCalledWith(108);
  });

  it("clears badge when goal is reached", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      _id: "day:2026-06-12",
      date: "2026-06-12",
      goalGrams: 150,
      intakes: [{ id: "1", time: "08:00", description: "Shake", grams: 150 }],
    });

    await syncTodayAppBadge();
    expect(clearAppBadge).toHaveBeenCalled();
  });

  it("clears badge when today has no goal", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      _id: "day:2026-06-12",
      date: "2026-06-12",
      intakes: [],
    });

    await syncTodayAppBadge();
    expect(clearAppBadge).toHaveBeenCalled();
  });
});
