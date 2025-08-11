// src/modules/payments/stripe.provider.ts
import { Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

export const StripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  useFactory: () => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error('STRIPE_SECRET_KEY est manquant dans l’ENV');
    }
    return new Stripe(secret, { apiVersion: '2025-07-30.basil' });
  },
};
