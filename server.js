const stripe = require('stripe')('sk_test_51QfbcgJYOGKywO3nG9VMqKcbzo0s1CITEKgcJGY1Xk44dtsbkmedNoc1sWSG44Qcb1lvdWPOxwwfW6jqkqdGOMQu00vUrFICJd');
const express = require('express');
const app = express();

const endpointSecret = 'whsec_...';

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  let event = request.body;

  if (endpointSecret) {
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log(`PaymentMethod attached: ${paymentMethod.id}`);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  response.status(200).send('Event received');
});

module.exports = app;
