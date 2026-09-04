import env from "../../config/env";
import { stripe } from "./stripe";
import { CreateCheckoutSessionPayload } from "./stripe.interface";

const createCheckoutSession = async (payload: CreateCheckoutSessionPayload) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: payload.currency,
          unit_amount: payload.amount * 100,
          product_data: {
            name: `${payload.propertyTitle} - Monthly Rent`,
          },
        },
      },
    ],

    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${env.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.cancelUrl,

    customer_email: payload.email,

    metadata: {
      paymentId: payload.paymentId,
      rentalAgreementId: payload.rentalAgreementId,
      rentalRequestId: payload.rentalRequestId,
      tenantId: payload.tenantId,
    },

    payment_intent_data: {
      metadata: {
        paymentId: payload.paymentId,
        rentalAgreementId: payload.rentalAgreementId,
      },
    },
  });

  return session;
};

const getCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return session;
};

export const stripeService = {
  createCheckoutSession,
  getCheckoutSession,
};
