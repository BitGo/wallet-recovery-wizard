import { Route, Routes } from 'react-router-dom';
import { AuthenticatedPageLayout, UnauthenticatedPageLayout } from './Auth';
import { BuildUnsignedSweepCoin } from './BuildUnsignedSweepCoin';
import { BuildUnsignedSweepIndex } from './BuildUnsignedSweepIndex';
import { Home } from './Home';
import { NonBitGoRecoveryCoin } from './NonBitGoRecoveryCoin';
import { NonBitGoRecoveryIndex } from './NonBitGoRecoveryIndex';
import { SuccessfulRecovery } from './SuccessfulRecovery';
import { WrongChainRecovery } from './WrongChainRecovery';

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
        path="/:env/wrong-chain-recovery"
        element={
          <AuthenticatedPageLayout
            Title="Wrong Chain Recoveries"
            Description="This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain."
          />
        }
      >
        <Route index element={<WrongChainRecovery />} />
      </Route>
    </Routes>
  );
}
