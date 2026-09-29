import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (m) => m.Login
      ),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(
        (m) => m.Register
      ),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then(
        (m) => m.Shell
      ),

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
          import('./features/transactions/transactions/transactions').then(
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
        path: 'parties',
        loadComponent: () =>
          import(
            './features/parties/parties/parties'
          ).then(
            (m) => m.Parties
          ),
      },
      {
        path: 'credit-cards',
        loadComponent: () =>
          import(
            './features/credit-cards/credit-cards/credit-cards'
          ).then(
            (m) => m.CreditCards
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
