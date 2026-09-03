import { readFile } from 'node:fs/promises';
import { decrypt } from '@bitgo/sdk-api';
import { buildLinesFromPDFNodes, parseKeycardFromLines } from '@bitgo/key-card';
import type { KeycardEntry, PDFTextNode } from '@bitgo/key-card';

const KEYCARD_PDF_PATH = 'RECOVERY_KEYCARD_PDF_PATH';

async function readKeycardPdfFromEnv(): Promise<Uint8Array> {
  const path = process.env[KEYCARD_PDF_PATH];

  if (path) {
    return new Uint8Array(await readFile(path));
  }

  throw new Error(`Set ${KEYCARD_PDF_PATH} for this test`);
}

/**
 * Loads the CI-only PDF fixture and reuses the keycard package's section parser.
 * This intentionally runs in the Playwright test process; the application does not
 * expose a keycard upload feature.
 */
export async function loadKeycardEntriesFromEnv(): Promise<KeycardEntry[]> {
  const { getDocument } = await import('pdfjs-dist');
  const pdfDocument = await getDocument({ data: await readKeycardPdfFromEnv() })
    .promise;
  const nodes: PDFTextNode[] = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if (!('str' in item) || !Array.isArray(item.transform)) {
        continue;
      }

      const text = item.str.replace(/\s+/g, ' ').trim();
      if (!text) {
        continue;
      }

      const x = Number(item.transform[4] ?? 0);
      const y = Number(item.transform[5] ?? 0);
      const width = 'width' in item ? Number(item.width ?? 0) : 0;

      nodes.push({ text, x, y, page: pageNumber, width });
    }
  }

  return parseKeycardFromLines(buildLinesFromPDFNodes(nodes));
}

export function getKeycardBoxValue(
  entries: KeycardEntry[],
  box: 'A' | 'B' | 'C' | 'D'
): string {
  const entry = entries.find(({ label }) => label.startsWith(`${box}:`));
  if (!entry) {
    throw new Error(`Keycard is missing Box ${box}`);
  }
  return entry.value;
}

export function decryptKeycardBoxValue(
  value: string,
  walletPassphrase: string
): Promise<string> {
  if (/^[xt]prv/.test(value)) {
    return Promise.resolve(value);
  }
  return decrypt(walletPassphrase, value);
}

export function hasKeycardPdfFixture(): boolean {
  return Boolean(process.env[KEYCARD_PDF_PATH]);
}
