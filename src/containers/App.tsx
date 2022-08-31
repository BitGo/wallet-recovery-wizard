import { Route, Routes } from 'react-router-dom';
import { BuildUnsignedSweepCoin } from './BuildUnsignedSweepCoin';
import { BuildUnsignedSweepIndex } from './BuildUnsignedSweepIndex';
import { Home } from './Home';
import { NonBitGoRecoveryCoin } from './NonBitGoRecoveryCoin';
import { NonBitGoRecoveryIndex } from './NonBitGoRecoveryIndex';
import { PageLayout } from '~/components';

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route
        path="/:env/non-bitgo-recovery/*"
        element={
          <PageLayout
            Title="Non-BitGo Recovery"
            Description="Use your self-managed hot wallet recovery key card to create and
            broadcast a transaction without relying on BitGo."
          />
        }
      >
        <Route index element={<NonBitGoRecoveryIndex />} />
        <Route path=":coin" element={<NonBitGoRecoveryCoin />} />
      </Route>
      <Route
        path="/:env/build-unsigned-sweep/*"
        element={
          <PageLayout
            Title="Build Unsigned Sweep"
            Description="This tool will construct an unsigned sweep transaction on the wallet
            you specify without using BitGo."
          />
        }
      >
        <Route index element={<BuildUnsignedSweepIndex />} />
        <Route path=":coin" element={<BuildUnsignedSweepCoin />} />
      </Route>
    </Routes>
  );
}
