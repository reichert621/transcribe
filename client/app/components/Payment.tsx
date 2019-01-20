import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { STRIPE_PUBLIC_KEY, fetchBalance } from '../helpers/payments';
import CheckoutForm from './CheckoutForm';
import { Box, Header } from './Common';

type PaymentProps = RouteComponentProps<{}> & {};
type PaymentState = {};

class Payment extends React.Component<PaymentProps, PaymentState> {
  constructor(props: PaymentProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    console.log('Fetching balance!');
    return fetchBalance()
      .then(res => {
        console.log('Successfully retrieved balance!', res);
      })
      .catch(err => {
        console.log('Error retrieving balance!', err);
      });
  }

  render() {
    return (
      <Box p={4}>
        <Header my={4}>Payment</Header>

        <StripeProvider apiKey={STRIPE_PUBLIC_KEY}>
          <Box>
            <Elements>
              <CheckoutForm />
            </Elements>
          </Box>
        </StripeProvider>
      </Box>
    );
  }
}

export default Payment;
