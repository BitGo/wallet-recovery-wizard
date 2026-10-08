import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormikHelpers } from 'formik';
import type { Dispatch, SetStateAction } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertBannerContext } from '~/contexts';
import { BuildUnsignedSweepCoin } from './BuildUnsignedSweepCoin';
import type { SolanaFormProps } from './SolanaForm';

type SolanaFormValues = Parameters<SolanaFormProps['onSubmit']>[0];

const solFormValues: SolanaFormValues = {
  bitgoKey: 'bitgo-key',
  recoveryDestination: 'destination',
  publicKey: '',
  secretKey: '',
  seed: undefined,
  apiKey: '',
};

const writeFile = vi.fn();

vi.mock('./SolanaForm', async () => {
  const actual =
    await vi.importActual<typeof import('./SolanaForm')>('./SolanaForm');

  return {
    ...actual,
    SolanaForm: ({ onSubmit }: SolanaFormProps) => {
      const helpers = {
        setSubmitting: vi.fn(),
      } as unknown as FormikHelpers<SolanaFormValues>;

      return (
        <button
          type="button"
          onClick={() => void onSubmit(solFormValues, helpers)}
        >
          Recover Funds
        </button>
      );
    },
  };
});

function NavigationState() {
  const location = useLocation();
  return (
    <output data-testid="navigation-state">
      {JSON.stringify(location.state)}
    </output>
  );
}

describe('BuildUnsignedSweepCoin Solana recovery', () => {
  beforeEach(() => {
    writeFile.mockResolvedValue(undefined);
    window.commands = {
      setBitGoEnvironment: vi.fn().mockResolvedValue(undefined),
      recover: vi
        .fn()
        .mockResolvedValue({ transactionHex: '0200000001abcdef' }),
      showSaveDialog: vi
        .fn()
        .mockResolvedValue({ filePath: '/tmp/recovery.json' }),
      writeFile,
    } as unknown as typeof window.commands;
    window.queries = {
      getChain: vi.fn().mockResolvedValue('sol'),
    } as unknown as typeof window.queries;
  });

  it('passes the coin in navigation state to the success route', async () => {
    const setAlert: Dispatch<SetStateAction<string | undefined>> = () =>
      undefined;
    const alertState: [
      string | undefined,
      Dispatch<SetStateAction<string | undefined>>,
    ] = [undefined, setAlert];

    render(
      <AlertBannerContext.Provider value={alertState}>
        <MemoryRouter initialEntries={['/test/build-unsigned-sweep/sol']}>
          <Routes>
            <Route
              path="/:env/build-unsigned-sweep/:coin"
              element={<BuildUnsignedSweepCoin />}
            />
            <Route
              path="/:env/build-unsigned-sweep/:coin/success"
              element={<NavigationState />}
            />
          </Routes>
        </MemoryRouter>
      </AlertBannerContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recover Funds' }));

    await waitFor(() => {
      expect(screen.getByTestId('navigation-state').textContent).toBe(
        JSON.stringify({ coin: 'sol' })
      );
    });
  });
});
