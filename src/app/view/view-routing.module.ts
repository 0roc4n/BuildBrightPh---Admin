import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewPage } from './view.page';
import { BootGuard } from '../guards/boot/boot.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path:'',
    canActivate:[BootGuard],
    component: ViewPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../pages/home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('../pages/orders/orders-routing.module').then( m => m.OrdersRoutingModule)
      },
      {
        path: 'analysis',
        loadChildren: () => import('../pages/analysis/analysis.module').then( m => m.AnalysisPageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('../pages/products/products-routing.module').then( m => m.ProductRoutingModule)
      },
      {
        path: 'verification',
        loadChildren: () => import('../pages/verification/verification.module').then( m => m.VerificationPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../pages/profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'quotation',
        loadChildren: () => import('../pages/quotation/quotation.module').then( m => m.QuotationPageModule)
      },
      {
        path: 'vouchers',
        loadChildren: () => import('../pages/vouchers/vouchers.module').then( m => m.VouchersPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../pages/settings/settings-routing.module').then( m => m.SettingsRoutingModule)
      },
    
    ]
  },

  {
    path: 'boot',
    loadChildren: () => import('../pages/boot/boot.module' ).then( m => m.BootPageModule),
    canActivate: [BootGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewPageRoutingModule {}
