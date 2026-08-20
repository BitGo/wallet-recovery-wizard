import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components';
import CelebrationCheck from './CelebrationCheck.json';

export function SuccessfulRecovery() {
  const location = useLocation();
  const locationState = location.state as {
    txId?: string;
    txHex?: unknown;
  } | null;
  const txId = locationState?.txId;
  const txHexValue = locationState?.txHex;
  const txHex =
    typeof txHexValue === 'string' && txHexValue.length > 0
      ? txHexValue
      : undefined;
  const [copyStatus, setCopyStatus] =
    useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') return;

    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  async function copyTxHex() {
    if (!txHex) return;

    try {
      await navigator.clipboard.writeText(txHex);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <div className="tw-flex-col tw-items-center tw-p-16">
      <div className="tw-px-8 tw-mb-2">
        <div className="tw-mb-4">
          <Player
            autoplay
            keepLastFrame
            src={CelebrationCheck}
            style={{ height: '100px', width: '100px' }}
          />
        </div>
        {txId ? (
          <div className="tw-text-center tw-pb-2 tw-max-w-prose">
            <div className="tw-text-label-1 tw-text-gray-900 tw-mb-2">
              Transaction broadcast successfully.
            </div>
            <div className="tw-text-label-2 tw-text-gray-700 tw-mb-1">
              Transaction ID:
            </div>
            <div className="tw-font-mono tw-text-xs tw-break-all tw-mb-3">
              {txId}
            </div>
            <a
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noreferrer"
              className="tw-text-blue-500 tw-underline"
            >
              View on Solscan &rarr;
            </a>
          </div>
        ) : (
          <div className="tw-text-center tw-text-label-1 tw-text-gray-900 tw-pb-2 tw-max-w-prose">
            We recommend that you use a third-party API to decode your txHex and
            verify its accuracy before broadcasting.
          </div>
        )}
        {txHex && (
          <details className="tw-mt-6 tw-max-w-prose">
            <summary className="tw-cursor-pointer tw-text-label-1 tw-font-semibold tw-text-gray-900">
              Show transaction hex
            </summary>
            <div className="tw-mt-3">
              <label htmlFor="transaction-hex" className="tw-sr-only">
                Transaction Hex
              </label>
              <textarea
                id="transaction-hex"
                aria-describedby="transaction-hex-helper"
                className="tw-w-full tw-box-border tw-p-4 tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-font-mono tw-text-xs tw-text-slate-900 tw-whitespace-pre-wrap tw-break-all tw-overflow-y-auto tw-max-h-64"
                value={txHex}
                readOnly
                rows={8}
              />
              <div
                id="transaction-hex-helper"
                className="tw-mt-1 tw-text-gray-700 tw-text-label-2"
              >
                Select the transaction hex to verify or broadcast it with a
                third-party API.
              </div>
              <div className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
                <Button
                  Variant="secondary"
                  Width="hug"
                  type="button"
                  onClick={() => void copyTxHex()}
                >
                  {copyStatus === 'copied' ? 'Copied' : 'Copy'}
                </Button>
                {copyStatus === 'error' && (
                  <div role="alert" className="tw-text-label-2 tw-text-red-500">
                    Copy failed. Select the transaction hex and copy it
                    manually.
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
      </div>
      <div className="tw-flex tw-justify-center tw-mt-4">
        <Button Tag={Link} to="/" Variant="secondary" Width="hug">
          Back to Home &rarr;
        </Button>
      </div>
    </div>
  );
}
