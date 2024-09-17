import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



const routes:Routes =[
  {
    path: '',
    redirectTo: 'product-list',
    pathMatch: 'full'
  },
  {
    path: 'add-product',
    loadComponent: () => import('./add-product/add-product.component').then( m => m.AddProductComponent)
  },

  {
    path: 'product-list',
    loadComponent: () => import('./product-list/product-list.component').then( m => m.ProductListComponent)
  },
  {
    path: 'product-categories',
    loadComponent: () => import('./product-categories/product-categories.component').then( m => m.ProductCategoriesComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews.component').then( m => m.ReviewsComponent)
  }
]



@NgModule({
  declarations: [],
  imports: [ RouterModule.forChild(routes)]
})
export class ProductRoutingModule { }
