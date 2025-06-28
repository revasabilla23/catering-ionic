import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage), canActivate: [AutoLoginGuard] },
  
  // Rute untuk Karyawan (tetap sama)
  { path: 'karyawan-dashboard', loadComponent: () => import('./karyawan-dashboard/karyawan-dashboard.page').then(m => m.KaryawanDashboardPage), canActivate: [AuthGuard] },
  
  // Rute untuk HRGA sekarang memiliki 5 tab
  {
    path: 'hrga',
    loadComponent: () => import('./hrga/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./hrga/hrga-dashboard/hrga-dashboard.page').then(m => m.HrgaDashboardPage)
      },
      {
        path: 'employees',
        loadComponent: () => import('./hrga/employee-list/employee-list.page').then(m => m.EmployeeListPage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./hrga/orders/orders.page').then(m => m.OrdersPage)
      },
      {
        path: 'konsumsi', // Rute baru
        loadComponent: () => import('./hrga/konsumsi/konsumsi.page').then( m => m.KonsumsiPage)
      },
      {
        path: 'report', // Rute baru
        loadComponent: () => import('./hrga/report/report.page').then( m => m.ReportPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Default route
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];