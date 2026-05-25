import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SignPsbt from './index';
import { SignPsbtForm } from './SignPsbtForm';

function createMockCommands(overrides = {}) {
  return {
    setBitGoEnvironment: vi.fn().mockResolvedValue(undefined),
    signPsbt: vi.fn().mockResolvedValue({ halfSignedPsbt: 'abc123psbt', coin: 'tbtc' }),
    showSaveDialog: vi.fn().mockResolvedValue({ filePath: '/tmp/test-output.json' }),
    writeFile: vi.fn().mockResolvedValue(undefined),
    recover: vi.fn(),
    broadcastTransaction: vi.fn(),
    createBroadcastableSweepTransaction: vi.fn(),
    unlock: vi.fn(),
    sweepV1: vi.fn(),
    recoverConsolidations: vi.fn(),
    wrongChainRecover: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    ...overrides,
  } as unknown as typeof window.commands;
}

describe('SignPsbtForm', () => {
  beforeEach(() => {
    window.commands = createMockCommands();
  });

  it('renders all required form fields', () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <SignPsbtForm onSubmit={onSubmit} />
      </MemoryRouter>
    );

    expect(screen.getByText(/sign unsigned psbt/i)).not.toBeNull();
    expect(screen.getByRole('combobox')).not.toBeNull();
    expect(screen.getByRole('button', { name: /sign psbt/i })).not.toBeNull();
  });

  it('renders recipient address and fee rate fields', () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <SignPsbtForm onSubmit={onSubmit} />
      </MemoryRouter>
    );

    expect(screen.getByText(/recipient address/i)).not.toBeNull();
    expect(screen.getByText(/fee rate \(sat\/vbyte\)/i)).not.toBeNull();
  });

  it('shows passphrase field initially hidden', () => {
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <SignPsbtForm onSubmit={onSubmit} />
      </MemoryRouter>
    );

    // Passphrase should not be visible when userKey is empty
    expect(screen.queryByText(/wallet passphrase/i)).toBeNull();
  });
});

describe('SignPsbt container', () => {
  beforeEach(() => {
    window.commands = createMockCommands();
  });

  function renderSignPsbt(env = 'test') {
    return render(
      <MemoryRouter initialEntries={[`/${env}/sign-psbt`]}>
        <Routes>
          <Route path="/:env/sign-psbt" element={<SignPsbt />} />
          <Route path="/:env/sign-psbt/success" element={<div>Success Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders the sign PSBT form container', () => {
    renderSignPsbt();
    expect(screen.getByRole('button', { name: /sign psbt/i })).not.toBeNull();
  });

  it('handles invalid environment gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/invalid/sign-psbt']}>
        <Routes>
          <Route path="/:env/sign-psbt" element={<SignPsbt />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/invalid environment/i)).not.toBeNull();
  });

  it('does not import Node.js modules in renderer code', () => {
    // Ensure renderer code doesn't use path.join() or os.homedir()
    // which would cause "require is not defined" error in browser context
    expect(() => {
      renderSignPsbt();
    }).not.toThrow(/require is not defined/);
  });
});
