import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { combineLatest, filter, firstValueFrom, forkJoin, from, lastValueFrom, map, mergeMap, Observable, of, Subject, switchMap, takeUntil, tap, take } from 'rxjs';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrdersService } from 'src/app/services/orders.service';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { TableComponent } from "../../../components/table/table.component";
import { TableInterface } from 'src/app/interfaces/table';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderDetailsModalComponent } from 'src/app/components/order-details-modal/order-details-modal.component';

@Component({
    selector: 'app-pending',
    templateUrl: './pending.component.html',
    styleUrls: ['./pending.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        ToolbarMenuComponent,
        TableComponent,
        ReactiveFormsModule
    ],

})
export class PendingComponent  implements OnInit, OnDestroy{

  unsubscribe$ = new Subject<void>()
  pendingOrders:any[] = []

  pendingForm = this.fb.group({
    pendingFormArray: this.fb.array([])
  })


  pendingOrders$:Observable<any> =  this.orderService.allOrders$.pipe(
    map((order)=> order?.filter((filterOrder:any)=>filterOrder.status === Status.Pending) ?? [] ),
    switchMap(filteredOrder => {
      if(filteredOrder.length > 0){
        const sorted = filteredOrder.sort((a:any, b:any) =>  b.timestamp - a.timestamp)
        const arr = sorted.map((order:any)=>{
          const group = this.fb.group({})
          if(order.deliveryMethod === 'delivery') group.addControl('minVehicleType',this.fb.control('', Validators.required))
          if(order.deliveryFee === 'too_far') group.addControl('setDeliveryFee',this.fb.control('', Validators.required))
          return group
        })
        this.pendingForm.setControl('pendingFormArray',this.fb.array(arr))

        const completeOrderData = sorted
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
                   
                      // console.log('Stocks', order.products[index].productDetails.variants = order.products[index].productDetails.variants[order.products[index].variants.variantIndex].in_stock)
                      // console.log(order.products[index].variants[0].variant,order.products[index].productDetails.variants[order.products[index].variants.variantIndex].in_stock )
                   
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
    tap((orders)=>{
        console.log("pending",orders);
        // console.log(this.pendingForm.controls);
    }
    )
  )


  constructor(public  dataQueries     : DataQueriesService,
              private orderService    : OrdersService,
              private helper          : HelperService,
              private alertController : AlertController,
              private modalController : ModalController,
              private fb: FormBuilder) {}

  ngOnDestroy() {
    this.unsubscribe$.next()
  }

  ngOnInit() {
    this.pendingOrders$.subscribe(see=>console.log(see)
    )
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


  tableData(i: number){
    return  this.pendingOrders[i].products.map((item:any,index: number)=>{
            //  #    ProductName     Variant              UnitCost      Quantity        Subtotal     Stock
      return [index + 1, item.name, item.variant??'N/A',  item.unitPrice , item.qty  , item.totalPrice,  item.productDetails?.quantity  ]
    })
  }

  async reject(orderId: string, clientId:string){
    console.log("orderId",orderId);

    const alert = await this.alertController.create({
      header:"Cancel Order",
      message: "You are about to cancel this order. Please state your reason.",
      inputs: [{
        type: 'textarea',
        name: 'reason',
        placeholder: 'State your reason'
      }],
      buttons:['Cancel',{
        text: "Confirm",
        handler:(data)=>{
          if(!data.reason || data.reason ===''){
            this.invalidReason(orderId,clientId)
          }
          else{
            this.dataQueries.declineOrder(orderId, data.reason, clientId)
          }
        }
      }]
    })
    alert.present()
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
  accept(pendingOrder : any, additionalValue?:any){
    const orderData = pendingOrder.products.map((item:any)=>{
      if(item.variants){
        if(item.productDetails.variants.colors){
          return{
            productReference: `/${pendingOrder.storeId}/${item.productId}/variants/colors/${item.variants[0].variantIndex}/types/${item.variants[1].variantIndex}`,
            in_stock: item.variants[0].details.in_stock - item.quantity
          }
        }else{
          return{
            productReference: `/${pendingOrder.storeId}/${item.productId}/variants/size/${item.variants[0].variantIndex}`,
            in_stock: item.variants[0].details.in_stock - item.quantity
          }
        }
        // return item.variants.map((variant:any,)=>{
        //   console.log(item);
        //   if(item.productDetails.variants.color){
        //     return{
        //       productReference: `/${pendingOrder.storeId}/${item.productId}/variants/color/${item.variants[0].variantIndex}`,
        //       in_stock: item.productDetails.variants.color[item.variantIndex].in_stock - item.quantity
        //     }
        //   }else{
        //     return{
        //       productReference: `/${pendingOrder.storeId}/${item.productId}/variants/${item.variants[0].variantIndex}`,
        //       in_stock: item.productDetails.variants[item.variantIndex].in_stock - variant.quantity
        //     }
        //   }
        // })
        
      }
      else{
        return {
          productReference: `/${pendingOrder.storeId}/${item.productId}`,
          in_stock: item.productDetails.in_stock - item.quantity
        }
      }
     }).flat()
     console.log("additionalValue",additionalValue);


    this.dataQueries.acceptOrder(pendingOrder.id,orderData, additionalValue?.minVehicleType,additionalValue?.setDeliveryFee)
  }

  async invalidReason(orderId: string, clientId:string){
    const alert = await this.alertController.create({
      header:"Invalid Reason",
      message: "Please try again.",
      buttons:["OK"]
    })
    alert.present()
    await alert.onWillDismiss()
    this.reject(orderId,clientId)
  }

  getFormFroup(index:number){
    return (this.pendingForm.get('pendingFormArray') as FormArray).at(index)
  }




}

