export interface CreateCheckoutSessionPayload {
  paymentId: string;
  rentalAgreementId: string;
  rentalRequestId: string;
  tenantId: string;

  amount: number;
  currency: string;

  propertyTitle: string;
}
