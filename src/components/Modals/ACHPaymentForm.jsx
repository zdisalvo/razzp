import React, { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';

const ACHPaymentForm = () => {
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

    if (amount) {
      createPaymentIntent();
    }
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
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
        alert('Payment successful: ' + confirmData.status);
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
      <h2>ACH Payment Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Enter Amount to Pay</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="any"
            required
          />
        </div>

        <div>
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="routingNumber">Routing Number</label>
          <input
            type="text"
            id="routingNumber"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit ACH Payment'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {paymentMethod && <pre>{JSON.stringify(paymentMethod, null, 2)}</pre>}
    </div>
  );
};

export default ACHPaymentForm;
