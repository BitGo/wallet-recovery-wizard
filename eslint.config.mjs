import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'scripts/**',
      'postcss.config.js',
      'tailwind.config.js',
      '.vscode/**',
      '.storybook/**',
      'eslint.config.mjs',
      // Fails at the parser level — must use ignores, not per-file overrides
      'src/components/Title/Title.test.tsx',
    ],
  },

  // Global settings
  {
    settings: {
      react: { version: 'detect' },
    },
  },

  ...tseslint.configs.recommended,

  // Type-checked rules require a tsconfig — scope to TS/TSX only
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs['recommended-latest'],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  importPlugin.flatConfigs.electron,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      'import/resolver': {
        alias: {
          map: [['~', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/no-unresolved': ['error', { ignore: ['\\.svg$'] }],
      'import/namespace': 'off',
    },
  },

  // Old errors, grandfathered in
  {
    files: ['electron/coinFactory.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['electron/main/index.ts'],
    rules: {
      'no-fallthrough': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['electron/preload/index.ts'],
    rules: {
      'import/no-duplicates': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
    },
  },
  {
    files: ['electron/types.ts', 'src/utils/types.ts'],
    rules: { '@typescript-eslint/no-duplicate-type-constituents': 'off' },
  },
  {
    files: ['src/components/CryptocurrencyIcon/CryptocurrencyDynamicIcon.tsx'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
  {
    files: ['src/components/CryptocurrencyIcon/CryptocurrencyIcon.tsx'],
    rules: { 'react/no-unknown-property': 'off' },
  },
  {
    files: ['src/containers/BroadcastTransactionCoin/SuiForm.tsx'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['src/containers/BuildUnsignedConsolidation/BuildUnsignedConsolidationCoin.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: [
      'src/containers/BuildUnsignedSweepCoin/CardanoForm.tsx',
      'src/containers/BuildUnsignedSweepCoin/CosmosForm.tsx',
      'src/containers/BuildUnsignedSweepCoin/SolanaForm.tsx',
    ],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
  {
    files: ['src/components/SelectAutocomplete/SelectAutocomplete.tsx'],
    rules: { '@typescript-eslint/no-base-to-string': 'off' },
  },
  {
    files: [
      'src/containers/BuildUnsignedConsolidation/GenericEcdsaForm.tsx',
      'src/containers/BuildUnsignedConsolidation/SolForm.tsx',
      'src/containers/BuildUnsignedConsolidation/SolTokenForm.tsx',
      'src/containers/BuildUnsignedConsolidation/SuiTokenForm.tsx',
      'src/containers/BuildUnsignedConsolidation/TronForm.tsx',
      'src/containers/BuildUnsignedConsolidation/TronTokenForm.tsx',
    ],
    rules: { '@typescript-eslint/no-unnecessary-type-assertion': 'off' },
  },
  {
    files: ['src/containers/CreateBroadcastableTransaction/CreateBroadcastableTransactionIndex.tsx'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
    },
  },
  {
    files: ['src/containers/EvmCrossChainRecoveryWallet/EvmCrossChainRecoveryWallet.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['src/containers/V1BtcSweep/index.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['src/containers/WrongChainRecovery/WrongChainRecovery.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['src/helpers/config.ts', 'src/helpers/index.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
  },
  {
    files: ['src/preload.d.ts'],
    rules: {
      'import/no-duplicates': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['vite.config.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  prettierConfig,
);
