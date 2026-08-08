export class FinanceDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceDomainError";
  }
}

