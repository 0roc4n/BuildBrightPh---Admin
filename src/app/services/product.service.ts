import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { DataQueriesService } from './data-queries.service';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private helper: HelperService,
              private dataQueries: DataQueriesService) { }

  getCategories(){
    // let fullCategories:any = sessionStorage.getItem('fullCategories')

    // if(fullCategories) return of(JSON.parse(fullCategories))
    // else{
    //   return this.dataQueries.getCategories()
    //   // .subscribe({
    //   //   next:(categories)=>{
    //   //     console.log('categories',categories);
    //   //   }
    //   // })
    // }
    // //   let categories = this.helper.objToArrWithId((await this.dataQueries.productCategoryQueries()).val())[0]
    // //   let product_list:any = await this.getProductList()

    // //   categories = categories?.map((cat:any)=>{
    // //       cat.productItems= [];
    // //       product_list.forEach((productItem:any) => {
    // //         if(productItem.category?.toLowerCase() === cat.name?.toLowerCase())
    // //         cat.productItems.push(productItem.id)
    // //       });
    // //       return cat
    // //     }
    // //   ) ?? []
    // //   sessionStorage.setItem('fullCategories',JSON.stringify(categories))
    // //   return categories
    // // }
  }

  async getProductList(){
    const product_list = sessionStorage.getItem('product_list')

    if(product_list){
      return JSON.parse(product_list)
    }
    else{
      // const finalProdList = this.helper.objToArrWithId((await this.dataQueries.productListQueries()).val()).map((prod)=>{
      //     if(prod.variants){
      //       prod.variants = this.helper.objToArr(prod.variants)
      //     }
      //     return prod
      //   }
      // )
      // console.log("finalProdList",finalProdList);
      // sessionStorage.setItem('product_list', JSON.stringify(finalProdList))
      // return finalProdList
    }
  }




}
