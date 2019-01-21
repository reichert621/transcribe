import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { register } from '../helpers/auth';
import { Box, Header, Input } from './Common';

type RegisterProps = RouteComponentProps<{}> & {};
type RegisterState = {
  email: string;
  password: string;
};

const Container = styled(Paper)`
  padding: 32px;
  margin: 0 auto;
  max-width: 400px;
`;

class Register extends React.Component<RegisterProps, RegisterState> {
  constructor(props: RegisterProps) {
    super(props);

    this.state = { email: '', password: '' };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = this.state;

    return register({ email, password })
      .then(result => {
        console.log('Success!', result);
        // Redirect to login
        this.props.history.push('/login');
      })
      .catch(err => {
        console.log('Error registering!', err);
      });
  };

  render() {
    return (
      <Box m={5}>
        <Container>
          <Header mb={2}>Register</Header>

          <form onSubmit={this.handleSubmit}>
            <Box>
              <TextField
                id="email"
                label="Email"
                type="email"
                margin="dense"
                fullWidth={true}
                onChange={e => this.setState({ email: e.currentTarget.value })}
              />
            </Box>

            <Box>
              <TextField
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                margin="dense"
                fullWidth={true}
                onChange={e =>
                  this.setState({ password: e.currentTarget.value })
                }
              />
            </Box>

            <Box mt={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth={true}
              >
                Sign Up
              </Button>
            </Box>
          </form>

          <Box mt={4}>
            <Typography>
              <Link to="/login">Already have an acccount? Log in here.</Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default Register;
