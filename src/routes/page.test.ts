import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "./+page.svelte";
import type { DayDocument, Preset } from "$lib/db/types";

vi.mock("$lib/db/day-repository", () => ({
  getDay: vi.fn(),
  addIntake: vi.fn(),
  removeIntake: vi.fn(),
  updateIntake: vi.fn(),
}));

vi.mock("$lib/db/preset-repository", () => ({
  getPresets: vi.fn(),
}));

vi.mock("$lib/db/pouch", () => ({
  subscribeToChanges: vi.fn(() => () => {}),
}));

import * as dayRepository from "$lib/db/day-repository";
import * as presetRepository from "$lib/db/preset-repository";

const emptyDay: DayDocument = {
  _id: "day:2026-06-12",
  date: "2026-06-12",
  intakes: [],
};

describe("daily overview page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dayRepository.getDay).mockResolvedValue(emptyDay);
    vi.mocked(presetRepository.getPresets).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows empty state and zero total", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    render(Page);

    await waitFor(() => {
      expect(screen.getByText(/No protein recorded yet/)).toBeInTheDocument();
    });
    expect(screen.getByText("0 g")).toBeInTheDocument();
  });

  it("shows Today label and hides jump button on current day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    render(Page);

    await waitFor(() => {
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Go to today" }),
    ).not.toBeInTheDocument();
  });

  it("jumps back to today from another day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(Page);

    await waitFor(() => {
      expect(dayRepository.getDay).toHaveBeenCalledWith("2026-06-12");
    });

    await user.click(screen.getByRole("button", { name: "Previous day" }));
    await user.click(screen.getByRole("button", { name: "Go to today" }));

    expect(dayRepository.getDay).toHaveBeenCalledWith("2026-06-12");
  });

  it("navigates to previous and next day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(Page);

    await waitFor(() => {
      expect(dayRepository.getDay).toHaveBeenCalledWith("2026-06-12");
    });

    await user.click(screen.getByRole("button", { name: "Previous day" }));
    expect(dayRepository.getDay).toHaveBeenCalledWith("2026-06-11");

    await user.click(screen.getByRole("button", { name: "Next day" }));
    expect(dayRepository.getDay).toHaveBeenCalledWith("2026-06-12");
  });

  it("submits add intake form", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      ...emptyDay,
      intakes: [{ id: "1", time: "10:00", description: "Shake", grams: 25 }],
    });

    render(Page);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add protein" }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add protein" }));
    await user.type(screen.getByLabelText(/^Description$/i), "Shake");
    await user.clear(screen.getByLabelText(/^Grams$/i));
    await user.type(screen.getByLabelText(/^Grams$/i), "25");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(dayRepository.addIntake).toHaveBeenCalledWith("2026-06-12", {
        time: "10:00",
        description: "Shake",
        grams: 25,
        multiplier: 1,
      });
    });
  });

  it("applies multiplier when saving intake", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(Page);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add protein" }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add protein" }));
    await user.type(screen.getByLabelText(/^Description$/i), "Shake");
    await user.clear(screen.getByLabelText(/^Grams$/i));
    await user.type(screen.getByLabelText(/^Grams$/i), "25");
    await user.clear(screen.getByLabelText(/^Multiplier$/i));
    await user.type(screen.getByLabelText(/^Multiplier$/i), "2");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(dayRepository.addIntake).toHaveBeenCalledWith("2026-06-12", {
        time: "10:00",
        description: "Shake",
        grams: 50,
        multiplier: 2,
      });
    });
  });

  it("shows remaining grams when day has a goal", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      ...emptyDay,
      goalGrams: 150,
      intakes: [{ id: "1", time: "10:00", description: "Shake", grams: 42 }],
    });

    render(Page);

    await waitFor(() => {
      expect(screen.getByText("Remaining protein")).toBeInTheDocument();
    });
    expect(screen.getByText("108 g")).toBeInTheDocument();
  });

  it("shows total intake when day has no goal", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      ...emptyDay,
      intakes: [{ id: "1", time: "10:00", description: "Shake", grams: 42 }],
    });

    render(Page);

    await waitFor(() => {
      expect(screen.getByText("Total protein")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Total protein").nextElementSibling,
    ).toHaveTextContent("42 g");
  });

  it("shows the multiplier in the overview", async () => {
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      ...emptyDay,
      intakes: [
        {
          id: "1",
          time: "10:00",
          description: "Shake",
          grams: 50,
          multiplier: 2,
        },
      ],
    });

    render(Page);

    await waitFor(() => {
      expect(screen.getByText("×2")).toBeInTheDocument();
    });
  });

  it("links each intake to its edit page", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
    vi.mocked(dayRepository.getDay).mockResolvedValue({
      ...emptyDay,
      intakes: [{ id: "1", time: "10:00", description: "Shake", grams: 25 }],
    });

    render(Page);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Edit Shake" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Edit Shake" })).toHaveAttribute(
      "href",
      "/intake/2026-06-12/1/",
    );
  });

  it("applies preset when chip is clicked", async () => {
    const user = userEvent.setup();
    const presets: Preset[] = [{ id: "p1", description: "Yogurt", grams: 20 }];
    vi.mocked(presetRepository.getPresets).mockResolvedValue(presets);

    render(Page);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Add protein" }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add protein" }));
    await user.click(screen.getByRole("button", { name: "Yogurt (20 g)" }));

    expect(screen.getByLabelText(/^Description$/i)).toHaveValue("Yogurt");
    expect(screen.getByLabelText(/^Grams$/i)).toHaveValue(20);
  });
});
