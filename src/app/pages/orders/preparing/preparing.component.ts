import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { combineLatest, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrdersService } from 'src/app/services/orders.service';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { TableComponent } from "../../../components/table/table.component";
import { PushNotifService } from 'src/app/services/push-notif.service';
import { OrderDetailsModalComponent } from 'src/app/components/order-details-modal/order-details-modal.component';

@Component({
    selector: 'app-preparing',
    templateUrl: './preparing.component.html',
    styleUrls: ['./preparing.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        ToolbarMenuComponent,
        TableComponent
    ]
})
export class PreparingComponent implements OnInit,OnDestroy{

  unsubscribe$ = new Subject<void>()
  riders$:Observable<any> = this.dataQueries.riders$
  // preparingOrders:any[] = []
  // tableHeader = ["ProductName","Price","Quantity","Total"]

  preparingOrders$: Observable<any> =  this.orderService.allOrders$.pipe(
    tap((order)=>{
      console.log("preparing order",order);
    }),
    map((order)=> order?.filter((filterOrder:any)=>filterOrder.status === Status.Preparing) ?? [] ),
    switchMap(filteredOrder => {
      if(filteredOrder.length > 0){
        const completeOrderData = filteredOrder
              .sort((a:any, b:any) =>  b.timestamp - a.timestamp)
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
        return combineLatest(completeOrderData)
      }
      else return of([])
    }),
    // tap((triggered)=>console.log('triggered',triggered)
    // )
  )


  constructor(private dataQueries     : DataQueriesService,
              private orderService    : OrdersService,
              private helper          : HelperService,
              private alertController : AlertController,
              private modalController : ModalController,
              private pushNotif       : PushNotifService) {}


  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.riders$.subscribe(data=>{
      console.log('Riders',data);
    })
  }


  ngOnInit() {
    // this.orderService.checkInitialized()
    // this.orderService.orderData$.pipe(
    //   map((orderArr: any)=> orderArr.filter((order:any)=>order.status == Status.Preparing)),
    //   takeUntil(this.unsubscribe)
    // ).subscribe((preparingOrders:any)=>{
    //   this.preparingOrders = preparingOrders
    //   console.log("preparingOrders",preparingOrders)
    //   }
    // )
    this.riders$.subscribe(data=>{
      console.log('Riders',data);
    })
  }

  // tableData(i: number){
  //   return  this.preparingOrders[i].items.map((item:any,index: number)=>{
  //        //    ProductName       Price         Quantity        total
  //     return [  item.name,   item.unitPrice , item.qty  , item.totalPrice  ]
  //   })
  // }


  async done(preparingOrder:any){
    // const orderId = this.preparingOrders[index].id;
    // const pushNotifKey = this.helper.objToArrWithId((await this.dataQueries.getClient(this.preparingOrders[index].clientId)).val())[0].pushNotifKey
    // console.log('PREP',preparingOrder);
    // console.log("SEE",orderId, pushNotifKey);
    this.dataQueries.doneOrder(preparingOrder.id)
    this.pushNotif.sendMessage(preparingOrder.clientInfo.pushNotifKey, (preparingOrder.deliveryMethod =='delivery')?`New Order is now ready for Delivery!`: `New Order is now ready for Pickup!`)
    if(preparingOrder.deliveryMethod!='delivery') return;
    const uns$ = this.riders$.subscribe((
      riders=>{
        for(let rider of riders){
          if(rider.pushNotifKey){
            this.pushNotif.sendMessage(rider.pushNotifKey,`New Order is now ready for Delivery!`)
          }
        }
        uns$.unsubscribe();
        // console.log("RIDERS",see);
        
      }
    ))
  }

  async trackModal(orderDetails:any){
    const modal = await this.modalController.create({
      component: OrderDetailsModalComponent,
      componentProps:{
        // orderData:{
          orderDetails: orderDetails,
          orderData : orderDetails,
        // }
      },
    })
    modal.present()
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
        if(discountedPrice < 0) return 0 + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
        else return discountedPrice + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
      }
      else if(voucherInfo.voucherDiscountType === 'percentage'){
        const discountedPrice = price - ( price * voucherInfo.voucherDiscountValue / 100 )
        return discountedPrice + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
      }
    } 
    else return price  + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
  }

}
