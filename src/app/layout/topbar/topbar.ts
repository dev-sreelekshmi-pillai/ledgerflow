import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-topbar',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly router = inject(Router);

  pageTitle = 'Dashboard';

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.pageTitle = this.getPageTitle(
          event.urlAfterRedirects
        );
      });
  }

  private getPageTitle(url: string): string {
    const route = url.split('/')[1];

    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      transactions: 'Transactions',
      budgets: 'Budgets',
      categories: 'Categories',
      reports: 'Reports',
      investments: 'Investments',
      debts: 'Debts',
      settings: 'Settings',
    };

    return titles[route] ?? 'Dashboard';
  }
}
