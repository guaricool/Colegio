export interface FeeConfig {
  standardMonthlyFeeEur?: number;
  earlyPaymentDayCutoff?: number;
  earlyPaymentFeeEur?: number;
  latePaymentFeeEur?: number;
}

export interface EffectiveFeeResult {
  expectedAmountEur: number;
  tier: 'PRONTO_PAGO' | 'REGULAR' | 'PAGO_TARDIO';
  label: string;
}

/**
 * Calcula el monto esperado dinámico de una cuota según la fecha de pago
 * - Pronto Pago (1 al día 10 del mes): €256 (Descuento aplicado)
 * - Pago Regular (días 11 en adelante dentro del mes): €270
 * - Pago Tardío / Mes Vencido: €280 (Recargo de €10)
 */
export function getEffectiveFeeAmount(
  baseAmountUsdOrEur: number,
  dueDateInput: Date | string,
  paymentDateInput: Date | string = new Date(),
  config?: FeeConfig
): EffectiveFeeResult {
  const cutoffDay = config?.earlyPaymentDayCutoff ?? 10;
  const earlyFee = config?.earlyPaymentFeeEur ?? 256;
  const standardFee = config?.standardMonthlyFeeEur ?? 270;
  const lateFee = config?.latePaymentFeeEur ?? 280;

  const dueDate = new Date(dueDateInput);
  const paymentDate = new Date(paymentDateInput);

  const payDay = paymentDate.getDate();
  const payMonth = paymentDate.getMonth();
  const payYear = paymentDate.getFullYear();

  const dueMonth = dueDate.getMonth();
  const dueYear = dueDate.getFullYear();

  // Mismo mes o antes de la fecha de vencimiento
  if (payYear < dueYear || (payYear === dueYear && payMonth <= dueMonth)) {
    if (payDay <= cutoffDay) {
      return {
        expectedAmountEur: earlyFee,
        tier: 'PRONTO_PAGO',
        label: `Pronto Pago (Días 1-${cutoffDay}): €${earlyFee}`,
      };
    } else {
      return {
        expectedAmountEur: standardFee,
        tier: 'REGULAR',
        label: `Pago Regular: €${standardFee}`,
      };
    }
  } else {
    // Mes vencido: Recargo por Pago Tardío
    return {
      expectedAmountEur: lateFee,
      tier: 'PAGO_TARDIO',
      label: `Pago Tardío (Mes Vencido): €${lateFee}`,
    };
  }
}
