export interface CalculateSafeCreditLimitInput {
  freeAvailableInCents: number;
  commitmentsUntilDueDateInCents: number;
  minimumReserveInCents: number;
}

export function calculateSafeCreditLimit({
  freeAvailableInCents,
  commitmentsUntilDueDateInCents,
  minimumReserveInCents,
}: CalculateSafeCreditLimitInput): number {
  return Math.max(
    0,
    freeAvailableInCents - commitmentsUntilDueDateInCents - minimumReserveInCents,
  );
}
