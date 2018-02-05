import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import LoginScreen from './screens/login';

import './App.css';

const App = () => (
  <Router>
    <Switch>
      <Redirect exact from='/' to='/login' />
      <Route path='/login' component={LoginScreen} />
      {/*<Route path='/me' component={UserScreen} />*/}
    </Switch>
  </Router>
);

export default App;
