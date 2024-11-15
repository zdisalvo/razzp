import React, { useState, useEffect } from 'react';
import { Button, Center, Stack } from '@chakra-ui/react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import usePayoutCreator from '../../hooks/usePayoutCreator'; // Adjust the path as needed

const ACHPaymentForm = ({ balance, onPayoutSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const { createPayout, loading: payoutLoading, error: payoutError } = usePayoutCreator();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('https://razzp-ach-18882c4d3efd.herokuapp.com/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: parseFloat(amount) * 100 }), // Send amount in cents
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId); // Store the PaymentIntent ID
      } catch (err) {
        setError('Failed to create payment intent');
      }
    };

    if (amount && parseFloat(amount) >= 10 && parseFloat(amount) <= balance) {
      createPaymentIntent();
    }
  }, [amount, balance]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    if (balance < 10) {
        setError(`You need a balance of at least $10 to cash out`)
    } else if (parseFloat(value) < 10 || parseFloat(value) > balance) {
        setError(`Please enter an amount between $10 and $${balance}`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!amount || isNaN(amount) || parseFloat(amount) < 10 || parseFloat(amount) > balance) {
      setError(`Please enter a valid amount between $10 and ${balance}`);
      setLoading(false);
      return;
    }

    if (!accountNumber || !routingNumber) {
      setError('Please enter a valid account and routing number');
      setLoading(false);
      return;
    }

    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      setError('Stripe has not loaded yet');
      setLoading(false);
      return;
    }

    try {
      const paymentMethodResponse = await stripe.createPaymentMethod({
        type: 'us_bank_account',
        us_bank_account: {
          account_holder_type: 'individual', // or 'company' as needed
          account_number: accountNumber,
          routing_number: routingNumber,
        },
        billing_details: {
          name: 'John Doe', // Replace with real user data
        },
      });

      if (paymentMethodResponse.error) {
        setError(paymentMethodResponse.error.message);
        setLoading(false);
        return;
      }

      const paymentMethodId = paymentMethodResponse.paymentMethod.id;

      const confirmResponse = await fetch('https://razzp-ach-18882c4d3efd.herokuapp.com/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          paymentIntentId, // Send the correct PaymentIntent ID here
        }),
      });

      const confirmData = await confirmResponse.json();
      if (confirmData.error) {
        setError(confirmData.error);
      } else {
        // Payment was successful, so trigger the payout creation
        createPayout(parseFloat(amount))
          .then(() => {
            alert('Payment and Payout successful!')
            onPayoutSuccess(parseFloat(amount));
          })
          .catch((err) => setError('Failed to record payout: ' + err.message));
        
        setPaymentMethod(paymentMethodResponse.paymentMethod);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <h2>ACH Payment Form</h2> */}
      <form onSubmit={handleSubmit}>
      <Stack spacing={1} ml={10}>
        <div>
          <label htmlFor="amount" style={{ marginRight: '3px' }}>Amount Requested&nbsp;&nbsp;&nbsp;$</label>
          <input
            type="number"
            style={{width: '80px'}}
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            min="0.01"
            step="any"
            required
          />
        </div>

        <div>
          <label htmlFor="accountNumber" style={{ marginRight: '7px' }}>Account&nbsp;&nbsp;#</label>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="routingNumber" style={{ marginRight: '7px' }}>Routing&nbsp;&nbsp;#</label>
          <input
            type="text"
            id="routingNumber"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            required
          />
        </div>

        <Center>
        <Button
        type="submit"
        alignContent="center"
        size="sm"
        isLoading={loading || payoutLoading} // Chakra UI's `isLoading` prop to show a spinner when loading
        loadingText="Processing..." // Text shown when the button is in a loading state
        disabled={loading || payoutLoading} // This will disable the button when loading or processing
        >
        Complete Payment Request
        </Button>
        </Center>
        </Stack>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {payoutError && <p style={{ color: 'red' }}>{payoutError}</p>}
      {/* {paymentMethod && <pre>{JSON.stringify(paymentMethod, null, 2)}</pre>} */}
    </div>
  );
};

export default ACHPaymentForm;
