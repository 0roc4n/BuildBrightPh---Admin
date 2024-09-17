import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const routes:Routes =[
  {
    path: '',
    redirectTo: 'distance-rate',
    pathMatch: 'full'
  },
  {
    path: 'distance-rate',
    loadComponent: () => import('./distance-rate/distance-rate.component').then( m => m.DistanceRateComponent)
  },
  {
    path: 'point-assignment',
    loadComponent: () => import('./point-assignment/point-assignment.component').then( m => m.PointAssignmentComponent)
  },
  {
    path: 'redeem-points',
    loadComponent: () => import('./redeem-points/redeem-points.component').then( m => m.RedeemPointsComponent)
  },  {
    path: 'ads',
    loadChildren: () => import('./ads/ads.module').then( m => m.AdsPageModule)
  },


]



@NgModule({
  declarations: [],
  imports: [ RouterModule.forChild(routes)]
})
export class SettingsRoutingModule { }
