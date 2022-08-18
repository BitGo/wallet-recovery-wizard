/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './containers/App';
import Home from './containers/Home';
import NonBitGoRecovery from './containers/NonBitGoRecovery/NonBitGoRecovery';
import NoCoinSelected from './containers/NonBitGoRecovery/Forms/NoCoinSelected';
import BitCoinForm from './containers/NonBitGoRecovery/Forms/BitcoinForm';
import EthereumForm from './containers/NonBitGoRecovery/Forms/EthereumForm';
import RippleForm from './containers/NonBitGoRecovery/Forms/RippleForm';

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
          <Route path="non-bitgo-recovery/*" element={<NonBitGoRecovery BitGoEnvironment="test"/>}>
            <Route index element={<NoCoinSelected />} />
            <Route path="btc" element={<BitCoinForm />} />
            <Route path="eth" element={<EthereumForm />} />
            <Route path="xrp" element={<RippleForm />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
