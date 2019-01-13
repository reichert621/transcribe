import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Recording from './components/Recording';
import Sandbox from './components/Sandbox';
import './App.less';

ReactDOM.render(
  <Router>
    <div className="app">
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/recording/:id" component={Recording} />
        <Route path="/sandbox" component={Sandbox} />
      </Switch>
    </div>
  </Router>,
  document.getElementById('app')
);
