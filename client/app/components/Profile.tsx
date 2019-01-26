import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import { Box, Flex, Container, Header } from './Common';
import { User, fetchCurrentUser } from '../helpers/auth';
import { STRIPE_PUBLIC_KEY } from '../helpers/payments';
import CheckoutForm from './CheckoutForm';
import NavBar from './NavBar';

type ProfileProps = RouteComponentProps<{}> & {};
type ProfileState = {
  user: User;
  showSuccessMessage: boolean;
};

type Product = {
  tier: number;
  credits: number;
  price: string;
  description?: string;
};

class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);

    this.state = { user: null, showSuccessMessage: false };
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

  handlePurchaseSuccess = () => {
    this.setState({ showSuccessMessage: true });

    return this.fetchCurrentUser().then(() => {
      setTimeout(() => this.setState({ showSuccessMessage: false }), 5000);
    });
  };

  renderProductOption(product: Product) {
    const { tier, credits, price } = product;

    return (
      <Container key={tier} p={3}>
        <Typography variant="h4" gutterBottom>
          Tier #{tier}
        </Typography>
        <Typography variant="h5">{credits} credits</Typography>
        <Typography variant="h6">{price}</Typography>
      </Container>
    );
  }

  render() {
    const { user, showSuccessMessage } = this.state;

    if (!user) return null;

    const { email, credits = 10 } = user;

    return (
      <React.Fragment>
        <NavBar />
        <Box p={4}>
          <Typography variant="h3" gutterBottom>
            {email}
          </Typography>

          <Typography variant="h5" gutterBottom>
            Credits available: {credits}
          </Typography>

          <Container mt={4} p={4}>
            <Typography variant="subtitle2">Purchase more credits</Typography>

            <StripeProvider apiKey={STRIPE_PUBLIC_KEY}>
              <Box>
                <Elements>
                  <CheckoutForm
                    email={email}
                    onPurchaseSuccess={this.handlePurchaseSuccess}
                  />
                </Elements>
              </Box>
            </StripeProvider>
          </Container>
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={showSuccessMessage}
          ContentProps={{ 'aria-describedby': 'success-id' }}
          message={<span id="success-id">Purchase successful!</span>}
        />
      </React.Fragment>
    );
  }
}

export default Profile;
