import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import Dashboard from './screens/dashboard';

const App = () => (
  <Router>
    <Switch>
      <Redirect exact from='/' to='/dashboard' />
      <Route path='/dashboard' component={Dashboard} />
      {/*<Route path='/me' component={UserScreen} />*/}
    </Switch>
  </Router>
);

export default App;
