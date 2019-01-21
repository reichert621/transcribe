import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { logout } from './helpers/auth';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Recording from './components/Recording';
import Payment from './components/Payment';
import Sandbox from './components/Sandbox';
import { Box, Button } from './components/Common';
import './App.less';

type AppProps = {};
type AppState = {};

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    // TODO: check auth status here?
  }

  render() {
    return (
      <Box>
        <CssBaseline />
        <Router>
          <div className="app">
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/recording/:id" component={Recording} />
              <Route path="/payment" component={Payment} />
              <Route path="/sandbox" component={Sandbox} />
            </Switch>
          </div>
        </Router>
      </Box>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
