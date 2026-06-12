import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PouchDB from 'pouchdb';
import MemoryAdapter from 'pouchdb-adapter-memory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';
import { clearDbSingleton, resetDbForTests } from '$lib/db/pouch';

PouchDB.plugin(MemoryAdapter);

describe('daily overview page e2e', () => {
	let db: PouchDB.Database;

	beforeEach(() => {
		db = new PouchDB(`test-e2e-${Date.now()}`, { adapter: 'memory' });
		resetDbForTests(db as never);
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-06-12T10:00:00'));
	});

	afterEach(async () => {
		await db.destroy();
		clearDbSingleton();
		vi.useRealTimers();
	});

	it('adds an intake and shows total grams', async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		render(Page);

		await waitFor(() => {
			expect(screen.getByText('0 g')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: 'Add protein' }));
		await user.type(screen.getByLabelText(/^Description$/i), 'Shake');
		await user.clear(screen.getByLabelText(/^Grams$/i));
		await user.type(screen.getByLabelText(/^Grams$/i), '25');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => {
			expect(screen.getByText('Shake')).toBeInTheDocument();
		});
		expect(screen.getByText('Total protein')).toBeInTheDocument();
		expect(screen.getByText('Total protein').nextElementSibling).toHaveTextContent('25 g');
	});
});
