import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell').then((m) => m.Shell),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(
            (m) => m.Dashboard
          ),
      },

      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/accounts').then(
            (m) => m.Accounts
          ),
      },

      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions').then(
            (m) => m.Transactions
          ),
      },

      {
        path: 'budgets',
        loadComponent: () =>
          import('./features/budgets/budgets').then(
            (m) => m.Budgets
          ),
      },

      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories').then(
            (m) => m.Categories
          ),
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then(
            (m) => m.Reports
          ),
      },

      {
        path: 'investments',
        loadComponent: () =>
          import('./features/investments/investments').then(
            (m) => m.Investments
          ),
      },

      {
        path: 'debts',
        loadComponent: () =>
          import('./features/debts/debts').then(
            (m) => m.Debts
          ),
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings').then(
            (m) => m.Settings
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
