import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Accounts',
      route: '/accounts',
      icon: 'account_balance',
    },
    {
      label: 'Credit Cards',
      icon: 'credit_card',
      route: '/credit-cards',
    },
    {
      label: 'Transactions',
      route: '/transactions',
      icon: 'receipt_long',
    },
    {
      label: 'Categories',
      route: '/categories',
      icon: 'category',
    },
    {
      label: 'Budgets',
      route: '/budgets',
      icon: 'account_balance_wallet',
    },
    {
      label: 'Investments',
      route: '/investments',
      icon: 'trending_up',
    }, {
      label: 'Debts',
      route: '/debts',
      icon: 'payments',
    }, {
      label: 'Parties',
      route: '/parties',
      icon: 'people',
    },
    {
      label: 'Reports',
      route: '/reports',
      icon: 'bar_chart',
    },



  ];
}
