import {
  getAccountClassification,
} from './account.model';

describe('getAccountClassification', () => {

  it('should classify bank accounts as assets', () => {
    expect(
      getAccountClassification('bank')
    ).toBe('asset');
  });

  it('should classify cash accounts as assets', () => {
    expect(
      getAccountClassification('cash')
    ).toBe('asset');
  });

  it('should classify investment accounts as assets', () => {
    expect(
      getAccountClassification('investment')
    ).toBe('asset');
  });

  it('should classify credit cards as liabilities', () => {
    expect(
      getAccountClassification('credit-card')
    ).toBe('liability');
  });

  it('should classify loans as liabilities', () => {
    expect(
      getAccountClassification('loan')
    ).toBe('liability');
  });

});
