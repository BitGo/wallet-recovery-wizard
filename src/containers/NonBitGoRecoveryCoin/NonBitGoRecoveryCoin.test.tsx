import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormikHelpers } from 'formik';
import type { Dispatch, SetStateAction } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Environments } from '@bitgo/sdk-core';
import { AlertBannerContext } from '~/contexts';
import {
  applySuiNodeUrls,
  SUI_JSON_RPC_MAINNET,
  SUI_JSON_RPC_TESTNET,
} from '../../../electron/main/suiNodeUrl';
import { NonBitGoRecoveryCoin } from './NonBitGoRecoveryCoin';
import type { UtxoFormProps, UtxoFormValues } from './UtxoForm';

const txHex = '0200000001abcdef';
const psbtFormValues: UtxoFormValues = {
  recoverySource: 'psbt',
  krsProvider: '',
  userKey: 'user-key',
  backupKey: 'backup-key',
  bitgoKey: 'bitgo-key',
  walletPassphrase: 'wallet-passphrase',
  feeRate: null,
  apiKey: '',
  recoveryDestination: '',
  scan: 20,
  psbt: 'unsigned-psbt',
};
const writeFile = vi.fn();

vi.mock('./UtxoForm', async () => {
  const actual = await vi.importActual<typeof import('./UtxoForm')>(
    './UtxoForm'
  );

  return {
    ...actual,
    UtxoForm: ({ onSubmit }: UtxoFormProps) => {
      const helpers = {
        setSubmitting: vi.fn(),
      } as unknown as FormikHelpers<UtxoFormValues>;

      return (
        <button
          type="button"
          onClick={() => void onSubmit(psbtFormValues, helpers)}
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

describe('NonBitGoRecoveryCoin PSBT recovery', () => {
  beforeEach(() => {
    writeFile.mockResolvedValue(undefined);
    window.commands = {
      setBitGoEnvironment: vi.fn().mockResolvedValue(undefined),
      recoverWithPsbt: vi.fn().mockResolvedValue({ txHex }),
      showSaveDialog: vi
        .fn()
        .mockResolvedValue({ filePath: '/tmp/recovery.json' }),
      writeFile,
    } as unknown as typeof window.commands;
    window.queries = {
      getChain: vi.fn().mockResolvedValue('btc'),
    } as unknown as typeof window.queries;
  });

  it('passes the signed PSBT txHex to the success route after saving JSON', async () => {
    const setAlert: Dispatch<SetStateAction<string | undefined>> = () =>
      undefined;
    const alertState: [
      string | undefined,
      Dispatch<SetStateAction<string | undefined>>
    ] = [undefined, setAlert];

    render(
      <AlertBannerContext.Provider value={alertState}>
        <MemoryRouter initialEntries={['/test/non-bitgo-recovery/btc']}>
          <Routes>
            <Route
              path="/:env/non-bitgo-recovery/:coin"
              element={<NonBitGoRecoveryCoin />}
            />
            <Route
              path="/:env/non-bitgo-recovery/:coin/success"
              element={<NavigationState />}
            />
          </Routes>
        </MemoryRouter>
      </AlertBannerContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recover Funds' }));

    await waitFor(() => {
      expect(screen.getByTestId('navigation-state').textContent).toBe(
        JSON.stringify({ txHex })
      );
    });

    expect(writeFile).toHaveBeenCalledWith(
      '/tmp/recovery.json',
      JSON.stringify({ txHex }, null, 2),
      { encoding: 'utf-8' }
    );
  });
});

describe('Sui recover RPC URLs', () => {
  it('points test and prod at live JSON-RPC nodes', () => {
    const environments = {
      test: { suiNodeUrl: 'https://fullnode.testnet.sui.io' },
      prod: { suiNodeUrl: 'https://fullnode.mainnet.sui.io' },
    } as Environments;

    applySuiNodeUrls(environments);

    expect(environments.test.suiNodeUrl).toBe(SUI_JSON_RPC_TESTNET);
    expect(environments.prod.suiNodeUrl).toBe(SUI_JSON_RPC_MAINNET);
  });
});
