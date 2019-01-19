import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { login } from '../helpers/auth';
import { Box, Header, Input, Button } from './Common';

type LoginProps = RouteComponentProps<{}> & {};
type LoginState = {
  email: string;
  password: string;
};

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);

    this.state = { email: '', password: '' };
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password } = this.state;

    return login({ email, password })
      .then(result => {
        console.log('Success!', result);
        // Redirect to dashboard
        this.props.history.push('/dashboard');
      })
      .catch(err => {
        console.log('Error logging in!', err);
      });
  };

  render() {
    return (
      <Box p={4}>
        <Header my={4}>Login</Header>

        <form onSubmit={this.handleSubmit}>
          <Box mb={2}>
            <Input
              type="email"
              placeholder="email"
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                this.setState({ email: e.currentTarget.value })
              }
            />
          </Box>

          <Box mb={2}>
            <Input
              type="password"
              placeholder="password"
              onChange={(e: React.FormEvent<HTMLInputElement>) =>
                this.setState({ password: e.currentTarget.value })
              }
            />
          </Box>

          <Button type="submit">Submit</Button>
        </form>

        <Box mt={4}>
          <Link to="/register">Register</Link>
        </Box>
      </Box>
    );
  }
}

export default Login;
