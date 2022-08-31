import '~/assets/styles/index.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './containers/App';
import { HashRouter } from 'react-router-dom';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
