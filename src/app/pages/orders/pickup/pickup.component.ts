import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { OrdersService } from 'src/app/services/orders.service';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { Camera, CameraResultType, CameraSource, GalleryImageOptions, ImageOptions } from '@capacitor/camera';
import { PhotoService } from 'src/app/services/photo.service';
import { DataStorageService } from 'src/app/services/data-storage.service';

@Component({
    selector: 'app-pickup',
    templateUrl: './pickup.component.html',
    styleUrls: ['./pickup.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent]
})
export class PickupComponent  implements OnInit {

  pickupOrders$:Observable<any> = this.orderService.allOrders$.pipe(
    map((orders)=>
      orders.filter((order:any)=>order.status === 2 && order.deliveryMethod === 'pickup')
    ),
    switchMap(filteredOrder => {
      if(filteredOrder.length > 0){
        console.log("filteredOrder",filteredOrder);
        const completeOrderData = filteredOrder
              .map((order:any)=> 
              {
                const orderArr = [
                  this.dataQueries.getUserById(order.clientId),
                  this.dataQueries.getUserById(order.storeId),
                  combineLatest((order.products as any[]).map((item:any)=>this.dataQueries.getProductById(item.productId)))
                ]
                if(order.voucherId){
                  if(order.voucherId){
                    orderArr.push(
                      this.dataQueries.getVoucherData(order.voucherId)
                    )
                  }
                }
                return combineLatest(orderArr).pipe(
                  map((userData:any)=>{
                    order.products.forEach((item:any, index:number)=>{
                      order.products[index].productDetails = userData[2][index]
                      if(userData[2][index]){
                        if(order.products[index].variants){
                          if( order.products[index].productDetails.variants.colors){
                            // const varIndex1 =  this.dataQueries.getVariantIndex(order.products[index].variants[0].variant,  order.products[index].productDetails.variants.colors);
                            // const variantIndex = this.dataQueries.getVariantIndex(order.products[index].variants[1].variant,  order.products[index].productDetails.variants.colors[varIndex1].types);
                            order.products[index].variants[0].details = order.products[index].productDetails.variants.colors[order.products[index].variants[0].variantIndex].types[order.products[index].variants[1].variantIndex];
                            console.log(order.products[index].variants[0].details);
                            // order.products[index].variants[0].variantIndex = variantIndex;
                            // order.products[index].productDetails.variants = order.products[index].productDetails.variants.colors[varIndex1].types
                          }else{
                            if(order.products[index].productDetails.variants.color){
                              // const variantIndex = this.dataQueries.getVariantIndex(order.products[index].variants[0].variant,  order.products[index].productDetails.variants.color);
                              const variantIndex = order.products[index].variants[0].variantIndex;
                              order.products[index].variants[0].details = order.products[index].productDetails.variants.color[variantIndex];
                              // order.products[index].variants[0].variantIndex = variantIndex;
                              // order.products[index].productDetails.variants = order.products[index].productDetails.variants.color;
                            }else if(order.products[index].productDetails.variants.size){
                              // const variantIndex = this.dataQueries.getVariantIndex(order.products[index].variants[0].variant,  order.products[index].productDetails.variants.size);
                              const variantIndex = order.products[index].variants[0].variantIndex;
                              order.products[index].variants[0].details = order.products[index].productDetails.variants.size[variantIndex];
      
                              // order.products[index].variants[0].variantIndex = variantIndex;
                              // order.products[index].productDetails.variants = order.products[index].productDetails.variants.size;
                            }
                          }
                        }
                      }
                    })
                    if(userData[3]){
                      return {
                        ...order,
                        clientInfo  : userData[0],
                        storeInfo   : userData[1],
                        voucherInfo : userData[3]
                      }
                    }
                    else{
                      return {
                        ...order,
                        clientInfo : userData[0],
                        storeInfo  : userData[1]
                      }
                    }
                   
                  }),
                )
              }
              
              )
              .sort((prev:any,curr:any)=>  curr.timestamp - prev.timestamp)
        return combineLatest(completeOrderData)
      }
      else return of([])

    }),
  )

  constructor(private dataQueries: DataQueriesService,
              private orderService: OrdersService,
              private photoService: PhotoService,
              private loadingController: LoadingController,
              private storageService: DataStorageService) { }

  ngOnInit() {
    this.pickupOrders$.subscribe((see)=>{
      console.log("see",see);
      
    })
  }


  paymentData(currentOrder:any){
    const price = currentOrder.products.reduce((prev:number,curr:any)=>{
      // if(curr.variants){
      //   return curr.variants.reduce((varPrev:number,varCurr:any)=>{
      //     return (varCurr.bulk_price ?? (varCurr.price * varCurr.quantity)) + varPrev
      //   },0) + prev
      // }
      // else 
      return (curr.bulk_price ?? (curr.price * curr.quantity)) + prev
    },0)
    if(currentOrder.voucherInfo){
      const voucherInfo = currentOrder.voucherInfo
      if(voucherInfo.voucherDiscountType === 'flat'){
        const discountedPrice = price - voucherInfo.voucherDiscountValue
        if(discountedPrice < 0) return 0
        else return discountedPrice
      }
      else if(voucherInfo.voucherDiscountType === 'percentage'){
        const discountedPrice = price - ( price * voucherInfo.voucherDiscountValue / 100 )
        return discountedPrice
      }
    }
    else return price
  }

  pickUp(){
    
  }

  async getImageForPickup(order:any){
    try{
      const photo = await this.photoService.askPhoto()
      if(photo?.webPath){
        const binary = await((await fetch(photo.webPath)).blob())
        await this.pickupOrder(binary,order) 
      }
    
    }
    catch(err){
      console.log("ERROR",err);
      
    }

  }


  async pickupOrder(binary:Blob, order:any){
    const loader = await this.loadingController.create({
      message: "Picking up order"
    })
    loader.present()
    const imageRef = await this.storageService.uploadPickupImage(
      order.id,
      binary
    )
    await this.dataQueries.updatePickupImage(order,imageRef)
    loader.dismiss()

  }



}
