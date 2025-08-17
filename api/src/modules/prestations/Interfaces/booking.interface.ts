export interface IBookingPublic {
  /** Identifiant du slot réservé */
  slotId: number;

  /** Id utilisateur si c'est un client inscrit, sinon null */
  userId?: number | null;

  /** Nom du réservant (user ou invité) */
  firstName: string | null;

  /** Prénom du réservant (user ou invité) */
  lastName: string | null;

  /** Email du réservant (user ou invité) */
  email: string | null;

  /** Optionnel : référence Stripe, utile backoffice */
  paymentIntentId?: string | null;
}
