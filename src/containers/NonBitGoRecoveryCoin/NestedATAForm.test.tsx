import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { NestedATAForm } from './NestedATAForm';

function renderForm(onSubmit = vi.fn()) {
  const result = render(
    <MemoryRouter>
      <NestedATAForm onSubmit={onSubmit} />
    </MemoryRouter>
  );
  const q = (name: string) =>
    result.container.querySelector<HTMLElement>(`[name="${name}"]`)!;
  return { ...result, q };
}

function fillValidForm(q: (name: string) => HTMLElement) {
  fireEvent.change(q('userKey'), {
    target: { value: '{"iv":"abc","ct":"encryptedUserKey"}' },
  });
  fireEvent.change(q('backupKey'), {
    target: { value: '{"iv":"def","ct":"encryptedBackupKey"}' },
  });
  fireEvent.change(q('bitgoKey'), {
    target: { value: 'xpubBitGoKey' },
  });
  fireEvent.change(q('walletPassphrase'), {
    target: { value: 'test-passphrase' },
  });
  fireEvent.change(q('recoveryDestination'), {
    target: { value: '7YbcLmVorrH7KCKMj38rFidsruisWi2CmvCTs4cygf8K' },
  });
  fireEvent.change(q('nestedAtaAddress'), {
    target: { value: 'FGuZSBhtreqSUsE86xokyjKz2i8VBtJzy6uMXXKyGHug' },
  });
  fireEvent.change(q('ownerAtaAddress'), {
    target: { value: 'Zfm98ZpVafydhFTYcsY6bHgubhB4cFgWFvbdEJxYhTA' },
  });
  fireEvent.change(q('tokenMintAddress'), {
    target: { value: 'ZBCNpuD7YMXzTHB2fhGkGi78MNsHGLRXUhRewNRm9RU' },
  });
}

describe('NestedATAForm', () => {
  it('renders all required fields', () => {
    const { q } = renderForm();

    expect(q('userKey')).not.toBeNull();
    expect(q('backupKey')).not.toBeNull();
    expect(q('bitgoKey')).not.toBeNull();
    expect(q('walletPassphrase')).not.toBeNull();
    expect(q('recoveryDestination')).not.toBeNull();
    expect(q('nestedAtaAddress')).not.toBeNull();
    expect(q('ownerAtaAddress')).not.toBeNull();
    expect(q('tokenMintAddress')).not.toBeNull();
    expect(q('apiKey')).not.toBeNull();
  });

  it('renders submit button with correct label', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /recover tokens/i })).not.toBeNull();
  });

  it('calls onSubmit with correct values when form is valid', async () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillValidForm(q);
    fireEvent.click(screen.getByRole('button', { name: /recover tokens/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
      const [values] = onSubmit.mock.calls[0] as [Record<string, string>][];
      expect(values.nestedAtaAddress).toBe('FGuZSBhtreqSUsE86xokyjKz2i8VBtJzy6uMXXKyGHug');
      expect(values.ownerAtaAddress).toBe('Zfm98ZpVafydhFTYcsY6bHgubhB4cFgWFvbdEJxYhTA');
      expect(values.tokenMintAddress).toBe('ZBCNpuD7YMXzTHB2fhGkGi78MNsHGLRXUhRewNRm9RU');
      expect(values.recoveryDestination).toBe('7YbcLmVorrH7KCKMj38rFidsruisWi2CmvCTs4cygf8K');
    });
  });

  it('does not call onSubmit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fireEvent.click(screen.getByRole('button', { name: /recover tokens/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('rejects API key that looks like a URL', async () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillValidForm(q);
    fireEvent.change(q('apiKey'), {
      target: { value: 'https://eth-mainnet.g.alchemy.com/v2/somekey' },
    });
    fireEvent.click(screen.getByRole('button', { name: /recover tokens/i }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/api key should not be a url/i)).not.toBeNull();
    });
  });

  it('accepts a valid optional API key', async () => {
    const onSubmit = vi.fn();
    const { q } = renderForm(onSubmit);

    fillValidForm(q);
    fireEvent.change(q('apiKey'), {
      target: { value: 'validApiKey123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /recover tokens/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });
});
