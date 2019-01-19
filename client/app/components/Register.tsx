import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { register } from '../helpers/auth';
import { Box, Header, Input, Button } from './Common';

type RegisterProps = RouteComponentProps<{}> & {};
type RegisterState = {
  email: string;
  password: string;
};

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
      <Box p={4}>
        <Header my={4}>Register</Header>

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
          <Link to="/login">Login</Link>
        </Box>
      </Box>
    );
  }
}

export default Register;
