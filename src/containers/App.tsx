import { Route, Routes } from 'react-router-dom';
import { AuthenticatedPageLayout, UnauthenticatedPageLayout } from './Auth';
import { BuildUnsignedSweepCoin } from './BuildUnsignedSweepCoin';
import { BuildUnsignedSweepIndex } from './BuildUnsignedSweepIndex';
import { Home } from './Home';
import { NonBitGoRecoveryCoin } from './NonBitGoRecoveryCoin';
import { NonBitGoRecoveryIndex } from './NonBitGoRecoveryIndex';
import { SuccessfulRecovery } from './SuccessfulRecovery';
import { WrongChainRecovery } from './WrongChainRecovery';
import { EvmCrossChainRecoveryIndex } from './EvmCrossChainRecoveryIndex';
import { EvmCrossChainRecoveryCoin } from './EvmCrossChainRecoveryCoin';
import { EvmCrossChainRecoveryWallet } from './EvmCrossChainRecoveryWallet/EvmCrossChainRecoveryWallet';
import { BuildUnsignedConsolidationIndex } from './BuildUnsignedConsolidation';
import { BuildUnsignedConsolidationCoin } from '~/containers/BuildUnsignedConsolidation/BuildUnsignedConsolidationCoin';
import { CreateBroadcastableTransactionIndex } from '~/containers/CreateBroadcastableTransaction';
import { BroadcastTransactionIndex } from './BroadcastTransactionIndex';
import { SuccessfulBroadcastTransaction } from './SuccessfulBroadcastTransaction';
import { BroadcastTransactionCoin } from './BroadcastTransactionCoin';

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route
        path="/:env/non-bitgo-recovery/*"
        element={
          <UnauthenticatedPageLayout
            Title="Non-BitGo Recovery"
            Description="Use your self-managed hot wallet recovery key card to create and
            broadcast a transaction without relying on BitGo."
          />
        }
      >
        <Route index element={<NonBitGoRecoveryIndex />} />
        <Route path=":coin" element={<NonBitGoRecoveryCoin />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
      <Route
        path="/:env/build-unsigned-sweep/*"
        element={
          <UnauthenticatedPageLayout
            Title="Build Unsigned Sweep"
            Description="This tool will construct an unsigned sweep transaction on the wallet
            you specify without using BitGo."
          />
        }
      >
        <Route index element={<BuildUnsignedSweepIndex />} />
        <Route path=":coin" element={<BuildUnsignedSweepCoin />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
      <Route
        path="/:env/build-unsigned-consolidation/*"
        element={
          <UnauthenticatedPageLayout
            Title="Build Unsigned Consolidation"
            Description="This tool will construct an unsigned consolidation transaction on the wallet you specify without relying on BitGo"
          />
        }
      >
        <Route index element={<BuildUnsignedConsolidationIndex />} />
        <Route path=":coin" element={<BuildUnsignedConsolidationCoin />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
      <Route
        path="/:env/create-broadcastable-transaction/*"
        element={
          <UnauthenticatedPageLayout
            Title="Create Broadcastable Transaction"
            Description="This tool will construct a broadcastable transaction given a signed transaction from OVC"
          />
        }
      >
        <Route index element={<CreateBroadcastableTransactionIndex />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
      <Route
        path="/:env/broadcast-transaction/*"
        element={
          <UnauthenticatedPageLayout
            Title="Broadcast Transaction"
            Description="Broadcast a signed transaction to the blockchain, without BitGo"
          />
        }
      >
        <Route index element={<BroadcastTransactionIndex />} />
        <Route path=":coin" element={<BroadcastTransactionCoin />} />
        <Route
          path=":coin/success"
          element={<SuccessfulBroadcastTransaction />}
        />
      </Route>
      <Route
        path="/:env/evm-cross-chain-recovery/*"
        element={
          <UnauthenticatedPageLayout
            Title="Evm Cross Chain Recovery"
            Description="Recover wallet funds sent to wrong chain(evm compatible) for hot/cold/custody wallets."
          />
        }
      >
        <Route index element={<EvmCrossChainRecoveryIndex />} />
        <Route path=":wallet" element={<EvmCrossChainRecoveryWallet />} />
        <Route path=":wallet/:coin" element={<EvmCrossChainRecoveryCoin />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
      <Route
        path="/:env/wrong-chain-recovery"
        element={
          <AuthenticatedPageLayout
            Title="Wrong Chain Recoveries"
            Description="This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain."
          />
        }
      >
        <Route index element={<WrongChainRecovery />} />
        <Route path=":coin/success" element={<SuccessfulRecovery />} />
      </Route>
    </Routes>
  );
}
