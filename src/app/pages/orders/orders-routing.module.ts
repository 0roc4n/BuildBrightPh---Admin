import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { PendingComponent } from './pending/pending.component';
// import { PreparingComponent } from './preparing/preparing.component';
// import { OrderListComponent } from './order-list/order-list.component';
// import { IonicModule } from '@ionic/angular';


const routes:Routes =[
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'pending',
    loadComponent: () => import('./pending/pending.component').then( m => m.PendingComponent)
  },
  {
    path: 'preparing',
    loadComponent: () => import('./preparing/preparing.component').then( m => m.PreparingComponent)
  },
  {
    path: 'list',
    loadComponent: () => import('./order-list/order-list.component').then( m => m.OrderListComponent)
  },
  {
    path: 'return-products',
    loadComponent:() => import('./return-products/return-products.component').then( m => m.ReturnProductsComponent)
  },
  {
    path: 'pickup',
    loadComponent:() => import('./pickup/pickup.component').then( m => m.PickupComponent) 
  }

]


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],

})
export class OrdersRoutingModule { }
