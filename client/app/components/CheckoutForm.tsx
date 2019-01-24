import * as React from 'react';
import {
  Elements,
  StripeProvider,
  ReactStripeElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  injectStripe
} from 'react-stripe-elements';
import Button from '@material-ui/core/Button';
// import StripeCheckout from 'react-stripe-checkout';
import { createCharge, createSubscription } from '../helpers/payments';
import { Box, Header } from './Common';

type CheckoutFormProps = ReactStripeElements.InjectedStripeProps & {};
type CheckoutFormState = {
  email: string;
};

class CheckoutForm extends React.Component<
  CheckoutFormProps,
  CheckoutFormState
> {
  constructor(props: CheckoutFormProps) {
    super(props);
    // FIXME: don't hardcode this
    this.state = { email: 'alex@alex.com' };
  }

  getStripeDefaultStyle() {
    return {
      base: {
        iconColor: '#666ee8',
        color: '#31325f',
        fontWeight: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: '#aab7c4'
        },
        ':-webkit-autofill': {
          color: '#666ee8'
        }
      },
      invalid: {
        color: '#B71C1C',
        iconColor: '#B71C1C'
      }
    };
  }

  createStripeToken = (): Promise<string> => {
    const { email } = this.state;

    return this.props.stripe
      .createToken({ name: email })
      .then(({ token }) => token.id);
  };

  createCharge = (token?: any) => {
    // // Only for StripeCheckout
    // const { id: tokenId } = token;
    console.log('Creating charge...');
    return this.createStripeToken()
      .then(tokenId => {
        return createCharge(tokenId);
      })
      .then(res => {
        console.log('Successfully created charge!', res);
      })
      .catch(err => {
        console.log('Error creating charge!', err);
      });
  };

  createSubscription = (token?: any) => {
    // // Only for StripeCheckout
    // const { id: tokenId } = token;
    const { email } = this.state;
    console.log('Creating subscription...');
    return this.createStripeToken()
      .then(tokenId => {
        return createSubscription(email, tokenId);
      })
      .then(res => {
        console.log('Successfully created subscription!', res);
      })
      .catch(err => {
        console.log('Error creating subscription!', err);
      });
  };

  render() {
    const style = this.getStripeDefaultStyle();

    return (
      <Box width={[1, 3 / 4, 1 / 2]} maxWidth="400px">
        {/* <StripeCheckout token={this.onToken} stripeKey={STRIPE_KEY} /> */}

        <CardElement style={style} hidePostalCode={true} />

        {/* <CardNumberElement style={style} /> */}
        {/* <CardExpiryElement style={style} /> */}
        {/* <CardCVCElement style={style} /> */}
        {/* <PostalCodeElement style={style} /> */}

        <Button
          variant="contained"
          color="primary"
          onClick={this.createSubscription}
          style={{ marginRight: 8 }}
        >
          Subscribe
        </Button>

        <Button variant="contained" color="primary" onClick={this.createCharge}>
          Charge
        </Button>
      </Box>
    );
  }
}

export default injectStripe(CheckoutForm);
