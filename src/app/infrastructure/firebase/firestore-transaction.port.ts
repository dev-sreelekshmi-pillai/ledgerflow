export interface FirestoreTransactionPort {
  run<T>(
    operation: (
      transaction: FirestoreTransactionContext
    ) => Promise<T>
  ): Promise<T>;
}

export interface FirestoreTransactionContext {
  get(
    reference: unknown
  ): Promise<{
    exists(): boolean;
    data(): Record<string, unknown> | undefined;
  }>;

  set(
    reference: unknown,
    data: unknown
  ): void;

  update(
    reference: unknown,
    data: Record<string, unknown>
  ): void;
}
