// Plattformskonfiguration för bokförsäljning
export const PLATFORM_SWISH_NUMBER = '0732627801';
export const PLATFORM_FEE_RATE = 0.10;

export function calcFee(price: number) {
  const fee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  return { fee, sellerNet: Math.round((price - fee) * 100) / 100 };
}

export const CONDITION_LABEL: Record<string, string> = {
  new: 'Nyskick',
  good: 'Bra skick',
  ok: 'Acceptabelt',
  worn: 'Slitet',
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  awaiting_payment: 'Väntar på Swish-betalning',
  payment_confirmed: 'Betalning bekräftad',
  released: 'Utbetald till säljare',
  refunded: 'Återbetald',
  failed: 'Misslyckad',
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Påbörjad',
  paid: 'Betald',
  delivered: 'Levererad',
  completed: 'Avslutad',
  cancelled: 'Avbruten',
};
