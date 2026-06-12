import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';
import type { Preset } from '$lib/db/types';

vi.mock('$lib/db/preset-repository', () => ({
	getPresets: vi.fn(),
	addPreset: vi.fn(),
	removePreset: vi.fn()
}));

vi.mock('$lib/db/settings-repository', () => ({
	getProteinGoal: vi.fn(),
	setProteinGoal: vi.fn()
}));

vi.mock('$lib/db/pouch', () => ({
	subscribeToChanges: vi.fn(() => () => {})
}));

import * as presetRepository from '$lib/db/preset-repository';
import * as settingsRepository from '$lib/db/settings-repository';

const seeded: Preset[] = [
	{ id: 'p1', description: 'Protein shake', grams: 30 },
	{ id: 'p2', description: 'Greek yogurt', grams: 15 }
];

describe('settings page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(presetRepository.getPresets).mockResolvedValue(seeded);
		vi.mocked(settingsRepository.getProteinGoal).mockResolvedValue(150);
	});

	it('renders preset list', async () => {
		render(Page);

		await waitFor(() => {
			expect(screen.getByText('Protein shake')).toBeInTheDocument();
		});
		expect(screen.getByDisplayValue('150')).toBeInTheDocument();
		expect(screen.getByText('Greek yogurt')).toBeInTheDocument();
		expect(screen.getByText('30 g')).toBeInTheDocument();
	});

	it('saves protein goal on submit', async () => {
		const user = userEvent.setup();
		render(Page);

		await waitFor(() => {
			expect(screen.getByDisplayValue('150')).toBeInTheDocument();
		});

		const goalInput = screen.getByPlaceholderText('e.g. 150');
		await user.clear(goalInput);
		await user.type(goalInput, '180');
		await user.click(screen.getByRole('button', { name: 'Save goal' }));

		await waitFor(() => {
			expect(settingsRepository.setProteinGoal).toHaveBeenCalledWith(180);
		});
	});

	it('adds a preset on submit', async () => {
		const user = userEvent.setup();
		render(Page);

		await waitFor(() => {
			expect(screen.getByText('Protein shake')).toBeInTheDocument();
		});

		await user.type(screen.getByPlaceholderText('e.g. Protein shake'), 'Eggs');
		await user.type(screen.getByLabelText(/^Grams$/i), '12');
		await user.click(screen.getByRole('button', { name: 'Add preset' }));

		await waitFor(() => {
			expect(presetRepository.addPreset).toHaveBeenCalledWith({
				description: 'Eggs',
				grams: 12
			});
		});
	});

	it('removes a preset', async () => {
		const user = userEvent.setup();
		render(Page);

		await waitFor(() => {
			expect(screen.getByText('Protein shake')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: 'Remove Protein shake' }));

		await waitFor(() => {
			expect(presetRepository.removePreset).toHaveBeenCalledWith('p1');
		});
	});
});
