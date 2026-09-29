import {
  getTransactionClassification,
  getTransactionTypeLabel,
} from './transaction.model';

describe('Transaction domain helpers', () => {

  describe('getTransactionClassification', () => {

    it('should classify income as income', () => {
      expect(
        getTransactionClassification('income')
      ).toBe('income');
    });

    it('should classify debt received as transfer', () => {
      expect(
        getTransactionClassification('debt-received')
      ).toBe('transfer');
    });

    it('should classify expense as expense', () => {
      expect(
        getTransactionClassification('expense')
      ).toBe('expense');
    });

    it('should classify transfer as transfer', () => {
      expect(
        getTransactionClassification('transfer')
      ).toBe('transfer');
    });

    it('should classify investment as transfer', () => {
      expect(
        getTransactionClassification('investment')
      ).toBe('transfer');
    });

    it('should classify debt given as transfer', () => {
      expect(
        getTransactionClassification('debt-given')
      ).toBe('transfer');
    });

    it('should classify loan repayment as transfer', () => {
      expect(
        getTransactionClassification('loan-repayment')
      ).toBe('transfer');
    });

  });

  describe('getTransactionTypeLabel', () => {

    it('should return Income for income', () => {
      expect(
        getTransactionTypeLabel('income')
      ).toBe('Income');
    });

    it('should return Expense for expense', () => {
      expect(
        getTransactionTypeLabel('expense')
      ).toBe('Expense');
    });

    it('should return Transfer for transfer', () => {
      expect(
        getTransactionTypeLabel('transfer')
      ).toBe('Transfer');
    });

    it('should return Investment for investment', () => {
      expect(
        getTransactionTypeLabel('investment')
      ).toBe('Investment');
    });

  });

});
