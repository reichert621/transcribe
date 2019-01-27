import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { register } from '../helpers/auth';
import { Box, Header, Container, Link } from './Common';

type RegisterProps = RouteComponentProps<{}> & {};
type RegisterState = {
  email: string;
  password: string;
  passwordConfirmation: string;
  hasSubmitted: boolean;
};

const RegisterContainer = styled(Container)`
  margin: 0 auto;
  max-width: 400px;
`;

class Register extends React.Component<RegisterProps, RegisterState> {
  constructor(props: RegisterProps) {
    super(props);

    this.state = {
      email: '',
      password: '',
      passwordConfirmation: '',
      hasSubmitted: false
    };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password, passwordConfirmation } = this.state;

    // TODO: handle errors better
    if (password !== passwordConfirmation) {
      this.setState({ hasSubmitted: true });

      return null;
    }

    return register({ email, password })
      .then(result => {
        console.log('Success!', result);
        // Redirect to login for now
        this.props.history.push('/login');
      })
      .catch(err => {
        console.log('Error registering!', err);
      });
  };

  render() {
    const { email, password, passwordConfirmation, hasSubmitted } = this.state;
    const hasPasswordError = hasSubmitted && password !== passwordConfirmation;

    return (
      <Box mx={[3, 4, 5]} my={[4, 5]}>
        <RegisterContainer p={[3, 4, 4]}>
          <Header mb={2}>Register</Header>

          <form onSubmit={this.handleSubmit}>
            <Box>
              <TextField
                id="email"
                label="Email"
                type="email"
                value={email}
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
                value={password}
                margin="dense"
                fullWidth={true}
                onChange={e =>
                  this.setState({ password: e.currentTarget.value })
                }
              />
            </Box>

            <Box>
              <TextField
                id="password-confirmation"
                label="Confirm Password"
                type="password"
                value={passwordConfirmation}
                margin="dense"
                fullWidth={true}
                error={hasPasswordError}
                helperText={hasPasswordError ? 'Passwords do not match' : ''}
                onChange={e =>
                  this.setState({ passwordConfirmation: e.currentTarget.value })
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
              <Link to="/login">Already have an account? Log in here.</Link>
            </Typography>
          </Box>
        </RegisterContainer>
      </Box>
    );
  }
}

export default Register;
