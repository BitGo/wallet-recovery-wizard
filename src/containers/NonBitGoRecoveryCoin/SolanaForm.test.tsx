import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SolanaForm } from './SolanaForm';

describe('SolanaForm', () => {
  it('links to the mainnet recovery guide for sol', () => {
    render(
      <MemoryRouter>
        <SolanaForm coin="sol" onSubmit={vi.fn()} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /solana recovery guide/i });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe(
      'https://github.com/BitGo/wallet-recovery-wizard/blob/master/SOL_MAINNET_RECOVERY_GUIDE.md'
    );
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('links to the devnet recovery guide for tsol', () => {
    render(
      <MemoryRouter>
        <SolanaForm coin="tsol" onSubmit={vi.fn()} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /solana recovery guide/i });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/BitGo/wallet-recovery-wizard/blob/master/SOL_DEVNET_RECOVERY_GUIDE.md'
    );
  });
});
