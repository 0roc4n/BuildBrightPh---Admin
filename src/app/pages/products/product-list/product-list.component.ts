import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {  ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom, last, map, Observable, ReplaySubject, Subject, Subscription, tap } from 'rxjs';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { HelperService } from 'src/app/services/helper.service';
import { ProductService } from 'src/app/services/product.service';
import { HttpClient } from '@angular/common/http';
import { log } from 'console';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent, ScrollbarDirective]
})
export class ProductListComponent  implements OnInit, OnDestroy {

  unsubscribe = new ReplaySubject<void>()


  productList$!:Observable<any>
  categories$!:Observable<any>;
  productCategory?:any

  filter!:string
  categoryId?:string
  showDeleteButton : Boolean = false

  // searchFilter:string = ''

  constructor(private dataQueries: DataQueriesService,
              private router : Router,
              private actRoute: ActivatedRoute,
              private alertCtrl: AlertController,
              private helper: HelperService,
              private productService: ProductService,
              private http: HttpClient,
              private loadingController: LoadingController,
              private afStorage: Storage,
              private location : Location,) {}


  ngOnDestroy(){
    this.unsubscribe.next()
  }

  catergorySubcategories:any[]= [];

  getSubcategories(category:any){
    this.catergorySubcategories = category.subcategories ?? []; 
  }

  ngOnInit() {
    this.categoryId = undefined;
    this.actRoute.queryParams.subscribe(
      params=>{
        this.categories$ = this.dataQueries.getCategories(this.unsubscribe);
        this.categoryId = undefined;
        this.getProductList(params)
      }
    )
  }

  filteredSubscribtion:Subscription;

  filteredProducts:any[];

  async getProductList(params:Params){
    if(params?.['withFilters']){
      this.categoryId = params?.['withFilters']
      if(this.categoryId){
        const obs$= this.categories$.subscribe(data=>{
        const found = data.find((category:any)=> category.id == this.categoryId);
        this.getSubcategories(found);
        this.selectedCategory = this.categoryId;
          obs$.unsubscribe();
        })
      }
      const category_name = await firstValueFrom(this.categories$.pipe(
                      map((categories:any[])=>categories.find((cat:any)=> cat.id === params?.['withFilters'])?.name)
                    ));

      this.filter = `Category ${category_name}`

      this.productList$ = this.dataQueries
        .getProducts(this.unsubscribe)
        .pipe(
          map((products:any[])=>{
            return products.filter((prod:any)=>prod.category ===params?.['withFilters'] ).sort((a:any, b:any) => {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              if (nameA < nameB) return -1
              if (nameA > nameB) return  1
              return 0
            }) 
          }),
          tap((filter)=>{
            if(filter.length === 0) this.showDeleteButton = true
          })
        )
    }
    else{
      this.productList$ = this.dataQueries.getProducts(this.unsubscribe)
      this.filter = "All Products"
    }

    const obs$ =    this.productList$.pipe(
      map(categories => categories.slice().sort((a:any, b:any) => a.name.localeCompare(b.name)))
    ).subscribe((data)=>{
      this.filteredProducts = data;
      obs$.unsubscribe();
    });


  }

  selectedCategory?:string|null;
  selectedSubcategory?:string|null;
  filterByCategory(event:any){
    const category = event.target.value;
    this.selectedCategory = category?.id;
    this.selectedSubcategory = undefined;
    this.catergorySubcategories = category?.subcategories ?? [];
    if(this.selectedCategory){
      const obs$ = this.productList$
        .pipe(
          map((products:any[])=>{
            return products.filter((prod:any)=>prod.category === category.id && (this.searchValue!=''? prod.metaKeyword.toLowerCase().includes(this.searchValue) :true) ).sort((a:any, b:any) => {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              if (nameA < nameB) return -1
              if (nameA > nameB) return  1
              return 0
            }) 
          }),
        ).subscribe(data=>{
          this.filteredProducts = data;
          obs$.unsubscribe();
        })
    }else{
      const obs$ = this.productList$
      .pipe(
        map((products:any[])=>{
          return products.sort((a:any, b:any) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1
            if (nameA > nameB) return  1
            return 0
          }) 
        }),
      ).subscribe(data=>{
        this.filteredProducts = data;
        obs$.unsubscribe();
      })
    }

    
  }

  filterBySubcategory(event:any){
    this.selectedSubcategory = event.target.value
    console.log(this.selectedSubcategory);
    if(this.selectedSubcategory){
      const obs$ = this.productList$
      .pipe(
        map((products:any[])=>{
          return products.filter((prod:any)=>{
            if(prod.category === this.selectedCategory && (this.searchValue!=''? prod.metaKeyword.toLowerCase().includes(this.searchValue) :true)){
              // if(prod.category.subcategories){
                return prod.subcategory == this.selectedSubcategory;
              //  }else{
              //   return true;
              //  }
            }else{
              return false;
            }
          } ).sort((a:any, b:any) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1
            if (nameA > nameB) return  1
            return 0
          }) 
        }),
      ).subscribe(data=>{
        this.filteredProducts = data;
        obs$.unsubscribe();
      })
    }else{
      const obs$ = this.productList$
      .pipe(
        map((products:any[])=>{
          return products.filter((prod:any)=>prod.category === this.selectedCategory && (this.searchValue!=''? prod.metaKeyword.toLowerCase().includes(this.searchValue) :true) ).sort((a:any, b:any) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1
            if (nameA > nameB) return  1
            return 0
          }) 
        }),
      ).subscribe(data=>{
        this.filteredProducts = data;
        obs$.unsubscribe();
      })
    }

  
  }

  editProduct(product: any){
    this.router.navigate(['products','add-product'],{
      // skipLocationChange: true,
      queryParams: {
        // product : product
        product : JSON.stringify(product)

      },
    })
  }

  async duplicateProduct(product : any){

    const loader = await this.loadingController.create({
      message: "Duplicating..."
    })

    loader.present()

    const duplicate:any = {
      category    : product.category               ,
      subcategory : product.subcategory,
      description : product.description            ,
      discount    : product.discount               ,
      item_code   : product.item_code              ,
      metaKeyword : product.metaKeyword            ,
      name        : `${product.name} (Duplicate)`  ,
    }


    if(product.variants){
      // duplicate.variants  =  await Promise.all(product.variants.map(async (variant:any)=>{
      //           const images = await Promise.all(variant.images.map((img:any)=>{
      //             return firstValueFrom(this.http.get(img.imageRef,{ responseType: 'blob' }))
      //           }
      //           ))

      //           return {
      //             in_stock      : variant.in_stock        ,
      //             price         : variant.price           ,
      //             variant_name  : variant.variant_name    ,
      //             images        : images.map((img)=>{
      //               return {binary:img }
      //             })
      //           }
      //       }))
    }
    else{
      duplicate.in_stock  =   product.in_stock
      duplicate.price     =   product.price
      duplicate.images    =   (await Promise.all(product.images.map((img:any)=>
                                  firstValueFrom(this.http.get(img.imageRef,{ responseType: 'blob' }))
                              ))).map((img)=>{
                                return {binary:img }
                              })
    }

    console.log("see",duplicate);

    try{
      await this.dataQueries.createProduct(duplicate)
      loader.dismiss()
    }
    catch(err){
      loader.dismiss()
      console.log("Err", err);
    }

    // try{
    //   duplicate.id = (await this.dataQueries.duplicateProductItem(duplicate)).key
    //   this.productList.push(duplicate)
    //   sessionStorage.setItem('product_list', JSON.stringify(this.productList))

    //   if(this.productCategoryList){
    //     const catReference = this.productCategory ?? this.productCategoryList[this.productCategoryList.findIndex((cat:any)=> cat.name.toLowerCase() === productItem.category.toLowerCase())]?.productItems
    //     catReference.push( duplicate.id)
    //     sessionStorage.setItem('fullCategories',JSON.stringify(this.productCategoryList))
    //   }
    // }
    // catch(error){
    //   console.log("ERROR", error);
    // }
  }

  async deleteProductItem(product: any){

    const successAlert= await this.alertCtrl.create({
      header: 'Success!',
      message: 'Product Item has been deleted',
      buttons: ['Confirmed']
    })

    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'Deleting this item cannot be undone.',
      buttons:['Cancel',
        {
          text: 'Ok',
          handler: async()=>{
            try{
              await this.dataQueries.deleteProduct(product);
              const obs$ = this.actRoute.queryParams.subscribe({
                next:(params)=>{
                  this.categoryId = undefined;
                  this.getProductList(params)
                  obs$.unsubscribe();
                }
              })
              successAlert.present()
            }
            catch(error){
              console.error(error);
            }
          }
        }
      ]
    })

    alert.present()
  }

  goToAddProduct(){
    this.router.navigate(['products','add-product'],{
      queryParams:{
        categoryId : this.categoryId
      }
    })
  }

  async deleteCategory(){
    const loading = await this.loadingController.create({
      message: 'Deleting category'
    })

    loading.present()
    await this.dataQueries.deleteCategory(this.categoryId!)
    // this.location.back();
    loading.dismiss()
    this.router.navigate(['/products/product-categories', {relaod: new Date().getMilliseconds()}])

  }
  searchValue:string ='';
  onSearchChange(event:any){
    this.searchValue =event.target.value.trim().toLowerCase();
    if(event.target.value.trim() === ''){
     const obs$= this.productList$.pipe(map((products)=> products.sort((a:any, b:any) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1
      if (nameA > nameB) return  1
      return 0
    }) )).subscribe(data=>{
      this.filteredProducts = data;
      obs$.unsubscribe();
    })
    
    }
    else{
      const obs$= this.productList$.pipe(
        map((products)=> products.filter((items:any)=>{
          if(items.metaKeyword.toLowerCase().includes(event.target.value.trim().toLowerCase())
          && (this.selectedCategory? items.category == this.selectedCategory : true)){
           if(items.category.subcategories){
            return items.category.subcategories.filter((subcat:any)=>{
              return subcat.id == this.selectedSubcategory;
            }).length;
           }else{
            return true;
           }
          }else{
            return false;
          }
        } 
        ).sort((a:any, b:any) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) return -1
          if (nameA > nameB) return  1
          return 0
        }))
      ).subscribe((data)=>{
        this.filteredProducts = data;
        obs$.unsubscribe();
      });
  
    }
  }
  limit = 30;
  loadMore(){
    this.limit += 30;
  }

  getFileContent(file: Blob): Observable<any> {
    return new Observable(obs => {
      const reader = new FileReader();
      
      reader.onloadend = (e:any) => {
        obs.next(new Map(Object.entries(JSON.parse((e.target!.result as string)))));
        obs.complete();
      }
      reader.readAsText(file);
    });
  }

  uploads = []
  async bulkUpload(event:any){
    // await this.dataQueries.deleteTestBulk();
    // const files = await this.dataQueries.loadImageRefs();
    // this.uploads = []
    // const filelist = event.target.files;
    // if(filelist.length<= 0)return;
    // var categoryList:any = [];
    // var lastCategory = '';
    // const loader = await this.loadingController.create({
    //   message: "Uploading Bulk..."
    // })
    // loader.present();
    // for (const file of filelist) {

    //   var result = await firstValueFrom(this.getFileContent(file));
    //   for(let [key,product] of result) {
    //     const prod:any = product;
    //     prod.key = key;
    //     if(!categoryList.includes(prod['top-category'])){
    //       lastCategory =  (await this.dataQueries.iterableCreateCategory(prod))!;
    //       categoryList.push(prod['top-category'])
    //       console.log(categoryList);
    //     }
    //     prod.catRef = lastCategory
    //     await this.dataQueries.iterableCreateProduct(prod,files);
    //   }

    //     loader.dismiss();
    // }
  }
  

  getFirstImageRef(productItem:any) {
    let firstKey: string | undefined;

    if (productItem.variants) {
      for (const key in productItem.variants) {
          if (productItem.variants.hasOwnProperty(key)) {
              firstKey = key;
              break;
          }
      }
    }

    try{
      if (firstKey) {
        return productItem.variants[firstKey][0].image[0].imageRef;
      } else{
          return productItem.images[0].imageRef;
      }
    }catch(e){
      console.log(productItem)
    }
  }
  
}
