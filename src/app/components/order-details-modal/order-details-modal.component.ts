import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { HelperService } from 'src/app/services/helper.service';
import { MapComponent } from "../map/map.component";
import { Observable, ReplaySubject, combineLatest, map, of, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-order-details-modal',
    templateUrl: './order-details-modal.component.html',
    styleUrls: ['./order-details-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ScrollbarDirective, MapComponent]
})
export class OrderDetailsModalComponent  implements OnInit , OnDestroy{


  // completeOrderData!:any
  orderData!:any
  riderDetails$:Observable<any> = of(null)
  orderDetails:any


  riderRTLocation = new ReplaySubject<google.maps.LatLngLiteral>(1)

  constructor(private dataQueries     : DataQueriesService,
              private modalController : ModalController,
              private helper          : HelperService) { }


  async ngOnInit() {
    console.log("Order Data",this.orderData );
    this.dataQueries.getOrder(this.orderData.id).pipe(
      switchMap((order:any)=>{

        const orderArray:Array<Observable<any>> = [combineLatest((order.products as any[]).map((item:any)=>this.dataQueries.getProductById(item.productId)))
        .pipe(
          map((order_items)=>{
            order_items.forEach((item:any, index:number)=>{
              order.products[index].productDetails = item
            })
            return order
          })
        )]
        if(order.voucherId){
          orderArray.push(
            this.dataQueries.getVoucherData(order.voucherId)
          )
        }
        return combineLatest(orderArray).pipe(
          map((ordered)=>{
            if(ordered[1]){
              return {
                ...ordered[0],
                voucherInfo: ordered[1]
              }
            }
            else return {
              ...ordered[0]
            }
          })
        )
      }),
      tap((order:any)=>{
        this.orderDetails = order

        console.log("orderDetails",order);

        if(order.riderId){
          this.riderDetails$ = this.dataQueries.getUserById(order.riderId)
        }
        if(order.status === Status.OnDelivery){
          this.dataQueries.getRTlocation(order.riderId)
          .pipe(
            tap((location:any)=>{
              this.riderRTLocation.next({
                lat:  location.coords.latitude,
                lng:  location.coords.longitude
              })
            })
          )
          .subscribe()
        }
      })


    ).subscribe((see)=>{
      console.log("See",see);

    })

  }

  ngOnDestroy(): void {
    if(this.onDelivery){
      this.riderRTLocation.complete()
    }
  }

  dismissModal(){
    this.modalController.dismiss()
  }

  get statusName(){
    switch(this.orderDetails?.status){
      case Status.Declined:
        return "Declined"
      case Status.Canceled:
        return "Canceled"
      case Status.Pending:
        return "Pending"
      case Status.Preparing:
        return "Preparing"
      case Status.OrderReady:
        return "Order is Ready"
      case Status.OnDelivery:
        return "On Delivery"
      case Status.Delivered:
      case Status.WithReview:
        return (this.orderDetails?.deliveryMethod=='delivery') ? "Delivered" : "Picked Up"
      case Status.Resolved:
        return "Returned"
      default:
        return "Error"
    }
  }

  get onDelivery(){
    return this.orderDetails?.status == Status.OnDelivery
  }

  paymentData(){
    const price = this.orderDetails?.products.reduce((prev:number,curr:any)=>{
      // if(curr.variants){
      //   return curr.variants.reduce((varPrev:number,varCurr:any)=>{
      //     return (varCurr.bulk_price ?? (varCurr.price * varCurr.quantity)) + varPrev
      //   },0) + prev
      // }
      // else
       return (curr.bulk_price ?? (curr.price * curr.quantity)) + prev
    },0)

    if(this.orderDetails?.voucherInfo){
      const voucherInfo = this.orderDetails.voucherInfo
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



  get storeCoordinates(){
   return JSON.parse(localStorage.getItem('userData')!).branches[0].coordinates

  }

}
