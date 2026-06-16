import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import PouchDB from "pouchdb";
import MemoryAdapter from "pouchdb-adapter-memory";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "./+page.svelte";
import SettingsPage from "./settings/+page.svelte";
import EditIntakeView from "$lib/components/EditIntakeView.svelte";
import { addIntake, getDay } from "$lib/db/day-repository";
import { clearDbSingleton, resetDbForTests } from "$lib/db/pouch";

const { gotoMock } = vi.hoisted(() => ({
  gotoMock: vi.fn(() => Promise.resolve()),
}));

vi.mock("$app/navigation", () => ({
  goto: gotoMock,
}));

PouchDB.plugin(MemoryAdapter);

describe("daily overview page e2e", () => {
  let db: PouchDB.Database;

  beforeEach(() => {
    db = new PouchDB(`test-e2e-${Date.now()}`, { adapter: "memory" });
    resetDbForTests(db as never);
    gotoMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-12T10:00:00"));
  });

  afterEach(async () => {
    await db.destroy();
    clearDbSingleton();
    vi.useRealTimers();
  });

  it("adds an intake and shows total grams", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(Page);

    await waitFor(() => {
      expect(screen.getByText("0 g")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Add protein" }));
    await user.type(screen.getByLabelText(/^Description$/i), "Shake");
    await user.clear(screen.getByLabelText(/^Grams$/i));
    await user.type(screen.getByLabelText(/^Grams$/i), "25");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Shake")).toBeInTheDocument();
    });
    expect(screen.getByText("Total protein")).toBeInTheDocument();
    expect(screen.getByText("Total protein").nextElementSibling).toHaveTextContent("25 g");
  });

  it("shows remaining grams when a goal is set and an intake is added", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const settingsView = render(SettingsPage);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. 150")).toBeInTheDocument();
    });
    await user.type(screen.getByPlaceholderText("e.g. 150"), "150");
    await user.click(screen.getByRole("button", { name: "Save goal" }));
    await waitFor(() => {
      expect(screen.getByDisplayValue("150")).toBeInTheDocument();
    });
    settingsView.unmount();

    render(Page);

    await waitFor(() => {
      expect(screen.getByText("Remaining protein")).toBeInTheDocument();
    });
    expect(screen.getByText("Remaining protein").nextElementSibling).toHaveTextContent("150 g");

    await user.click(screen.getByRole("button", { name: "Add protein" }));
    await user.type(screen.getByLabelText(/^Description$/i), "Shake");
    await user.clear(screen.getByLabelText(/^Grams$/i));
    await user.type(screen.getByLabelText(/^Grams$/i), "42");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Shake")).toBeInTheDocument();
    });
    expect(screen.getByText("Remaining protein").nextElementSibling).toHaveTextContent("108 g");
  });

  it("edits and deletes an intake", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    await addIntake("2026-06-12", {
      id: "intake-1",
      time: "10:00",
      description: "Shake",
      grams: 25,
    });

    const editView = render(EditIntakeView, { props: { date: "2026-06-12", id: "intake-1" } });

    await waitFor(() => {
      expect(screen.getByLabelText(/^Description$/i)).toHaveValue("Shake");
    });

    const descriptionInput = screen.getByLabelText(/^Description$/i);
    await user.click(descriptionInput);
    await user.keyboard("{Control>}a{/Control}Large shake");
    const gramsInput = screen.getByLabelText(/^Grams$/i);
    await user.click(gramsInput);
    await user.keyboard("{Control>}a{/Control}40");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(gotoMock).toHaveBeenCalled();
    });

    const afterEdit = await getDay("2026-06-12");
    expect(afterEdit.intakes[0]).toMatchObject({
      description: "Large shake",
      grams: 40,
    });

    editView.unmount();
    gotoMock.mockClear();
    render(EditIntakeView, { props: { date: "2026-06-12", id: "intake-1" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(gotoMock).toHaveBeenCalled();
    });

    const afterDelete = await getDay("2026-06-12");
    expect(afterDelete.intakes).toHaveLength(0);
  });
});
