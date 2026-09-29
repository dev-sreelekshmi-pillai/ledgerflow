import { Transaction } from './transaction.model';
import {
  LedgerEffect,
  calculateLedgerEffects,
} from './ledger-effect';
import { validateTransaction } from './transaction-validator';

export interface LedgerResult {
  transaction: Transaction;
  effects: LedgerEffect[];
}

export function processTransaction(
  transaction: Transaction
): LedgerResult {
  validateTransaction(transaction);

  const effects =
    calculateLedgerEffects(transaction);

  return {
    transaction,
    effects,
  };
}
