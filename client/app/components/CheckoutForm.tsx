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
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
// import StripeCheckout from 'react-stripe-checkout';
import {
  createCharge,
  createSubscription,
  PRODUCTS
} from '../helpers/payments';
import { Box, Flex } from './Common';

type CheckoutFormProps = ReactStripeElements.InjectedStripeProps & {
  email: string;
  onPurchaseSuccess?: () => void;
};
type CheckoutFormState = {
  productId: string;
  isPurchasing: boolean;
};

const noop = () => true;

class CheckoutForm extends React.Component<
  CheckoutFormProps,
  CheckoutFormState
> {
  element: stripe.elements.Element = null;

  constructor(props: CheckoutFormProps) {
    super(props);

    this.state = { productId: '', isPurchasing: false };
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
    const { email } = this.props;

    return this.props.stripe
      .createToken({ name: email })
      .then(({ token }) => token.id);
  };

  createCharge = (token?: any) => {
    this.setState({ isPurchasing: true });
    const { onPurchaseSuccess = noop } = this.props;
    // // Only for StripeCheckout
    // const { id: tokenId } = token;
    const { productId } = this.state;
    console.log('Creating charge...');
    return this.createStripeToken()
      .then(tokenId => {
        return createCharge(tokenId, productId);
      })
      .then(res => {
        console.log('Successfully created charge!', res);
        this.element.clear(); // Reset form
        this.setState({ isPurchasing: false, productId: '' });
      })
      .then(() => onPurchaseSuccess())
      .catch(err => {
        console.log('Error creating charge!', err);
        this.setState({ isPurchasing: false });
      });
  };

  handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ productId: e.target.value });
  };

  render() {
    const { productId, isPurchasing } = this.state;
    const style = this.getStripeDefaultStyle();

    return (
      <Box width={[1, 3 / 4, 1 / 2]} maxWidth="400px">
        {/* <StripeCheckout token={this.onToken} stripeKey={STRIPE_KEY} /> */}

        <Flex>
          <Box style={{ minWidth: 400, paddingTop: 14 }} mr={4}>
            <CardElement
              style={style}
              onReady={ref => (this.element = ref)}
              hidePostalCode={true}
              disabled={isPurchasing}
            />
          </Box>

          <FormControl style={{ minWidth: 240 }}>
            <InputLabel htmlFor="product">Select Product</InputLabel>
            <Select
              value={productId}
              onChange={e => this.handleSelectProduct(e)}
              disabled={isPurchasing}
              inputProps={{ name: 'product', id: 'product' }}
            >
              <MenuItem value="">None</MenuItem>
              {PRODUCTS.map(product => {
                const { name, price, description } = product;

                return (
                  <MenuItem key={name} value={name}>
                    {description} - ${price}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Flex>

        {/* <CardNumberElement style={style} /> */}
        {/* <CardExpiryElement style={style} /> */}
        {/* <CardCVCElement style={style} /> */}
        {/* <PostalCodeElement style={style} /> */}

        <Box my={3}>
          <Button
            variant="contained"
            color="primary"
            disabled={isPurchasing}
            onClick={this.createCharge}
          >
            {isPurchasing ? 'Purchasing...' : 'Purchase Credits'}
          </Button>
        </Box>
      </Box>
    );
  }
}

export default injectStripe(CheckoutForm);
