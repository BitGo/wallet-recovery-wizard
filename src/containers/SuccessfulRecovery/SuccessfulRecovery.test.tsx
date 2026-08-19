import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SuccessfulRecovery } from './SuccessfulRecovery';

vi.mock('@lottiefiles/react-lottie-player', () => ({
  Player: () => null,
}));

describe('SuccessfulRecovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the existing recovery message without transaction hex', () => {
    render(
      <MemoryRouter initialEntries={['/test/non-bitgo-recovery/btc/success']}>
        <SuccessfulRecovery />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/use a third-party API to decode your txHex/i)
    ).not.toBeNull();
    expect(screen.queryByLabelText('Transaction Hex')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Copy' })).toBeNull();
  });

  it('renders and copies transaction hex from navigation state', async () => {
    const txHex = '0200000001abcdef';
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/test/non-bitgo-recovery/btc/success',
            state: { txHex },
          },
        ]}
      >
        <SuccessfulRecovery />
      </MemoryRouter>
    );

    const disclosure = screen
      .getByText('Show transaction hex')
      .closest('details');
    expect(disclosure?.hasAttribute('open')).toBe(false);
    fireEvent.click(screen.getByText('Show transaction hex'));
    expect(disclosure?.hasAttribute('open')).toBe(true);

    const transactionHex = screen.getByLabelText('Transaction Hex');
    expect((transactionHex as HTMLTextAreaElement).value).toBe(txHex);
    expect(transactionHex.hasAttribute('readonly')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(txHex);
      expect(screen.getByRole('button', { name: 'Copied' })).not.toBeNull();
    });
  });

  it('shows a copy error while keeping transaction hex available', async () => {
    const txHex = '0200000001abcdef';
    const writeText = vi
      .fn()
      .mockRejectedValue(new Error('Clipboard unavailable'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/test/non-bitgo-recovery/btc/success',
            state: { txHex },
          },
        ]}
      >
        <SuccessfulRecovery />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Show transaction hex'));
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/copy failed/i);
      expect(screen.getByLabelText('Transaction Hex').value).toBe(txHex);
    });
  });
});
