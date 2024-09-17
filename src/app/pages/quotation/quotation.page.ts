import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, ReplaySubject, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { QuotationModalComponent } from 'src/app/components/quotation-modal/quotation-modal.component';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.page.html',
  styleUrls: ['./quotation.page.scss'],
})
export class QuotationPage implements OnInit {

  pendingQuotations$  = new ReplaySubject<any[]>(1)
  declinedQuotations$ = new ReplaySubject<any[]>(1)
  approvedQuotatons$ = new ReplaySubject<any[]>(1)
  offeredQuotatons$ = new ReplaySubject<any[]>(1)


  constructor(private orderService    : OrdersService,
              private dataQueries     : DataQueriesService,
              private modalController : ModalController) { }

  ngOnInit() {
    this.orderService.allOrders$.pipe(
      // map((quotations:any)=>quotations.filter((order:any)=> order.status === 0 && order.quotation?.status === 'pending' || order.quotation?.status === 'declined')),
      map((quotations:any)=>quotations.filter((order:any)=> order.quotation )),
      switchMap(filteredOrder => {
        if(filteredOrder.length > 0){
          console.log("filteredOrder",filteredOrder);
          const completeOrderData = filteredOrder
                .map((order:any)=> combineLatest([
                  this.dataQueries.getUserById(order.clientId),
                  this.dataQueries.getUserById(order.storeId),
                  combineLatest((order.products as any[]).map((item:any)=>this.dataQueries.getProductById(item.productId)))
                ]).pipe(
                  map((userData)=>{
                    order.products.forEach((item:any, index:number)=>{
                      order.products[index].productDetails = userData[2][index]
                    })
                    return {
                      ...order,
                      clientInfo : userData[0],
                      storeInfo  : userData[1]
                    }
                  }),
                ));
          return combineLatest(completeOrderData)
        }
        else return of([])
      }),
      tap((quotation:any)=>{
        const pending : any[] = []
        const declined: any[] = []
        const approved: any[] = []
        const offered: any[] = []
        quotation?.forEach((order:any)=>{
          if(order.quotation){
            if(order.quotation.status === Status.Pending) pending.push(order)
            else if(order.quotation.status == Status.Offered) offered.push(order)
            else if (order.quotation.status === Status.Declined) declined.push(order)
            else if (order.quotation.status === Status.Resolved)  approved.push(order)
          }
        })
        this.pendingQuotations$.next(pending)
        this.declinedQuotations$.next(declined)
        this.approvedQuotatons$.next(approved)
        this.offeredQuotatons$.next(offered)
      })
    ).subscribe()

    this.pendingQuotations$.asObservable().subscribe((pending)=>{
      console.log("pending", pending);
    })


    this.declinedQuotations$.asObservable().subscribe((declined)=>{
      console.log("declined", declined);
      
    })




  }

  async quotationDetailsModal(quotationDetails:any){
    const modal = await this.modalController.create({
      component: QuotationModalComponent,
      componentProps:{
        orderId     : quotationDetails.id,
        clientInfo  : quotationDetails.clientInfo,
        storeInfo   : quotationDetails.storeInfo
      },
      cssClass:'quotationModal'
    })
    modal.present()
  }

}
