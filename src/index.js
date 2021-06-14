import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

const { ipcRenderer } = require('electron');
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

ipcRenderer.on('login-success', (event, arg) => {
  console.log(arg); // prints "pong"
});
ipcRenderer.send('login', { username: 'tom', password: 'blah' });
