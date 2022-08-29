import '~/assets/styles/index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './containers/App';
import Home from './containers/Home';
import NonBitGoRecovery from './containers/NonBitGoRecovery';
import BuildUnsignedSweep from './containers/BuildUnsignedSweep';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route
            path="/:env/non-bitgo-recovery/*"
            element={<NonBitGoRecovery />}
          />
          <Route
            path="/:env/build-unsigned-sweep/*"
            element={<BuildUnsignedSweep />}
          />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
