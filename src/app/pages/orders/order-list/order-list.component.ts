import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, Observable, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Status } from 'src/app/interfaces/status';
import { TableInterface } from 'src/app/interfaces/table';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { HelperService } from 'src/app/services/helper.service';
import { OrdersService } from 'src/app/services/orders.service';
import { TableComponent } from "../../../components/table/table.component";
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { OrderDetailsModalComponent } from 'src/app/components/order-details-modal/order-details-modal.component';
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { Database, get, onValue, ref } from '@angular/fire/database';
import { unwatchFile } from 'fs';
// import { MatTableModule } from '@angular/material/table'
// import { MatTableDataSource,MatTable } from '@angular/material/table';
// import { MatSortModule  } from '@angular/material/sort';
// import {  } from '@angular/material/table';
interface OrderTable  {
  id: string,
  date: number,
  cust_name: string,
  amount: number,
  status: number,
}

interface CompleteOrder extends OrderTable{
  clientDetails: any
}

@Component({
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonicModule,
        TableComponent,
        ToolbarMenuComponent,
        ScrollbarDirective,
        // MatTableModule,
        // MatSortModule,
    ],
    providers:[CurrencyPipe]
})
export class OrderListComponent  implements OnInit, OnDestroy {

  headerArray:string[] = ['Date', 'Customer Name', 'Amount', 'Status']

  allDataItems!:any[]
  filteredDataItems:BehaviorSubject<any[]> = new BehaviorSubject([] as any[])
  unsubscribe$ = new Subject<void>()

  orderRef = ref(this.db, `/orders`);
  orders:any[] = []
  data:any[] =[]

  statEnum =Status;

  allOrders$:Observable<any> =  this.orderService.allOrders$.pipe(
    map((order)=> order?.filter((filterOrder:any)=>filterOrder.status !== Status.InCart && filterOrder.status) ?? [] ),
    switchMap(filteredOrder => {
      if(filteredOrder.length > 0){
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
              
            );
        return combineLatest(completeOrderData.reverse())
      }
      else return of([])
      }),
  )



  constructor(private dataQueries     : DataQueriesService,
              private orderService    : OrdersService,
              private helper          : HelperService,
              private alertController : AlertController,
              private modalController : ModalController,
              private loadingController: LoadingController,
              private currencyPipe: CurrencyPipe,
              private cd: ChangeDetectorRef,
              private db : Database
              ) {}
  ngOnDestroy(): void {
    this.unsubscribe$.next()
  }



    // async ngOnInit(){
    //   const loading = await this.loadingController.create({
    //     message: "Getting Orders..."
    //   })
    //   this.allOrders$
    //   .pipe(
    //     map((allOrders)=>allOrders.sort((prev:any, curr:any)=>curr.timestamp - prev.timestamp )),

    //     tap((allOrders)=>{
    //       this.allDataItems = []
    //       allOrders.forEach((orderItem:any)=>{
    //         const date = new Date(orderItem.timestamp)

    //         this.allDataItems.push({
    //           data: [orderItem.id, `${date.toDateString()} ${date.toLocaleTimeString()}` , `${orderItem.clientInfo.fullname.first} ${orderItem.clientInfo.fullname.middleInitial} ${orderItem.clientInfo.fullname.last} `, this.currencyPipe.transform(this.paymentData(orderItem), "PHP"), this.getStatus(orderItem.paymentMethod,orderItem.status)],
    //           clientDetails : orderItem.clientInfo
    //           }
    //         )
    //       })
    //       this.filteredDataItems.next(this.allDataItems.map((item:any)=>item.data))
    //     })
    //   )
    //   .subscribe()
    // }

  ngOnInit(): void {
  //   this.data = [];
  //   onValue(this.orderRef, (snapshot) => {
  //     const prod = snapshot.val();

  //     this.data = prod
  //     console.log('ORDERS',this.data)
  // });
  }


  getStatus(deliveryMethod:string,status:number){
    switch (status) {
      case Status.Declined:
        return 'Declined'
      case Status.Canceled:
        return 'Cancelled'
      case Status.Pending:
        return 'Pending'
      case Status.Preparing:
        return 'Preparing'
      case Status.OrderReady:
        // return 'Order is Ready'
        return deliveryMethod === 'pickup' ? 'Ready for Pickup':'Ready for Delivery' 
      case Status.OnDelivery:
        return 'On Delivery'
      case Status.Delivered:
      case Status.WithReview:
        return deliveryMethod === 'pickup' ? 'Picked Up':'Delivered' 
      case Status.Resolved:
        return 'Returned';
      default:
        return 'Error'
    }
  }

  async sampleModal(orderID:string){
    const modal = await this.modalController.create({
      component: OrderDetailsModalComponent,
      componentProps:{
        orderData:{
          orderID:  orderID,
          clientDetails: this.allDataItems.find((items:any)=>items.data[0] === orderID).clientDetails
        }
      },
      cssClass: 'quotationModal'
    })
    modal.present()
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

  search:string = ''

  onSearchInput(event: any) {
    this.search= event.target.value;
    // You can perform additional actions based on the search term
  }

  matchWord(target:string, search:string){
    return  target.toLowerCase().trim().includes(search.toLowerCase().trim())
  }

  searchProduct(products:any,search:string){
    for(let product of products){
      if(product.name.toLowerCase().trim().includes(search.toLowerCase().trim())){
        return true;
      }
    }
    return false;
  }

  getDate(date:string){
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',','[]').replace(',','').replace('[]',',');
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
  convertToArray(value: any): any[] {
    return Array.isArray(value) ? value : [value];
  }
  
  getCustomerName(name:any){
    const userRef = ref(this.db, `/users/${name}`)
    let last
    let mid
    let first

    onValue(userRef, (snapshot) => {
      const prod = snapshot.val();

      last = prod.fullname.last
      first = prod.fullname.first
      mid = prod.fullname.middleInitial

    });
    return `${first} ${mid} ${last}`;
  }
}
