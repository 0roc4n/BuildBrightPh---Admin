import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable, ReplaySubject, Subject, map, tap } from 'rxjs';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { HelperService } from 'src/app/services/helper.service';
import { ProductService } from 'src/app/services/product.service';
import { AddCategoryModalComponent } from 'src/app/components/add-category-modal/add-category-modal.component';

@Component({
    selector: 'app-product-categories',
    templateUrl: './product-categories.component.html',
    styleUrls: ['./product-categories.component.scss',],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent ,ScrollbarDirective]
})
export class ProductCategoriesComponent  implements OnInit , OnDestroy{

  unsubscribe = new Subject<void>
  categories$  = this.dataQueries.getCategories(this.unsubscribe)
  filteredCategories$ = this.categories$.pipe(
    map(categories => categories.slice().sort((a:any, b:any) => a.name.localeCompare(b.name))),
  );
  // categories$ = this.dataQueries
  //   .getCategories(this.unsubscribe)
    
    


  constructor(private dataQueries: DataQueriesService,
              private router: Router,
              private helper: HelperService,
              private productService: ProductService,
              private cd : ChangeDetectorRef,
              private modalController: ModalController
              ) { }
  ngOnInit() {

    this.filteredCategories$.subscribe(data=>{
      // obs$.unsubscribe();
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next()
  }

  productItems(filterName:any){
    this.router.navigate(['products','product-list'],{
      queryParams:{
        withFilters: filterName
      }
    })
  }

  async goToCategory(category?: any){
    const modal = await this.modalController.create({
      component:AddCategoryModalComponent,
      componentProps: {
        category: category
      }
    })
    modal.present()

    modal.onWillDismiss().then(data=>{
      // this.filteredCategories$ =
      const obs$ =  this.filteredCategories$.pipe(
        map(categories => categories.slice().sort((a:any, b:any) => a.name.localeCompare(b.name))), 
      ).subscribe(data=>{
        obs$.unsubscribe();
      });
      
    })
 
    // this.categories =JSON.parse(sessionStorage.getItem('fullCategories')!)
  }


  onSearchChange(event:any){
    if(event.detail.value === ''){
      this.filteredCategories$ = this.categories$.pipe(
        map(categories => categories.slice().sort((a:any, b:any) => a.name.localeCompare(b.name))),
      );
    }
    else{
      this.filteredCategories$ = this.categories$.pipe(
        map((categories)=> categories.filter((category:any)=>category.name.toLowerCase().includes(event.detail.value.toLowerCase())).sort((a:any, b:any) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) return -1
          if (nameA > nameB) return  1
          return 0
        }) )
      )
    }
  }


}


