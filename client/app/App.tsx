import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import { logout } from './helpers/auth';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Recording from './components/Recording';
import Payment from './components/Payment';
import AudioPlayer from './components/AudioPlayer';
import Profile from './components/Profile';
import Sandbox from './components/Sandbox';
import { Box, Button } from './components/Common';
import './App.less';

const theme = createMuiTheme({
  palette: {
    primary: blue
  },
  typography: {
    useNextVariants: true
  }
});

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
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="app">
            <Switch>
              <Route exact path="/" component={Dashboard} />
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/recording/:id" component={Recording} />
              <Route path="/profile" component={Profile} />
              <Route path="/payment" component={Payment} />
              <Route path="/player" component={AudioPlayer} />
              <Route path="/ny" component={AudioPlayer} />
              <Route path="/sandbox" component={Sandbox} />
            </Switch>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
