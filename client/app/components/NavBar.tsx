import * as React from 'react';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { logout, fetchCurrentUser, User } from '../helpers/auth';
import { Flex } from './Common';

type NavBarProps = {};
type NavBarState = {
  user: User;
  anchorEl: any;
};

class NavBar extends React.Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);

    this.state = {
      user: null,
      anchorEl: null
    };
  }

  componentDidMount() {
    return this.fetchCurrentUser();
  }

  fetchCurrentUser = () => {
    return fetchCurrentUser()
      .then(({ user }) => {
        this.setState({ user });
      })
      .catch(err => {
        console.log('Error fetching current user!', err);
      });
  };

  handleMenu = (e: React.SyntheticEvent<{}>) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleLogout = () => {
    return logout()
      .then(() => console.log('Successfully logged out!'))
      .catch(err => console.log('Error logging out!', err));
  };

  render() {
    const { anchorEl, user } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
              <NavLink to="/" style={{ color: 'white' }}>
                Transcriptions
              </NavLink>
            </Typography>
            <Flex alignItems="center">
              {user && user.credits && (
                <Typography style={{ color: 'white', marginRight: 16 }}>
                  Credits available: {user.credits}
                </Typography>
              )}
              <IconButton
                aria-owns={open ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                onClick={this.handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={open}
                onClose={this.handleClose}
              >
                <MenuItem onClick={this.handleClose}>
                  <NavLink to="/profile">My Account</NavLink>
                </MenuItem>
                <MenuItem onClick={this.handleLogout}>
                  <NavLink to="/login">Logout</NavLink>
                </MenuItem>
              </Menu>
            </Flex>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default NavBar;
