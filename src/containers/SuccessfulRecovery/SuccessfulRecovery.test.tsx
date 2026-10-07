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

  it('shows Solana guide link alongside the recovery message', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/test/build-unsigned-sweep/sol/success',
            state: { coin: 'sol' },
          },
        ]}
      >
        <SuccessfulRecovery />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/use a third-party API to decode your txHex/i)
    ).not.toBeNull();
    const link = screen.getByRole('link', { name: /this guide/i });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe(
      'https://github.com/BitGo/wallet-recovery-wizard/blob/master/SOL_MAINNET_RECOVERY_GUIDE.md'
    );
  });

  it('keeps the generic message without a guide link for non-Solana builds', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/test/build-unsigned-sweep/btc/success',
            state: { coin: 'btc' },
          },
        ]}
      >
        <SuccessfulRecovery />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/use a third-party API to decode your txHex/i)
    ).not.toBeNull();
    expect(screen.queryByRole('link', { name: /this guide/i })).toBeNull();
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
