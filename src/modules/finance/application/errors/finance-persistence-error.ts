export class FinancePersistenceError extends Error {
  constructor(
    message: string,
    readonly databaseCode?: string,
  ) {
    super(message);
    this.name = "FinancePersistenceError";
  }
}

