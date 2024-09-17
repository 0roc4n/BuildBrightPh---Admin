import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { ReturnProductModalComponent } from 'src/app/components/return-product-modal/return-product-modal.component';
import { Status } from 'src/app/interfaces/status';

@Component({
    selector: 'app-return-products',
    templateUrl: './return-products.component.html',
    styleUrls: ['./return-products.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent]
})
export class ReturnProductsComponent  implements OnInit , OnDestroy{
  unsubscribe$ = new Subject<void>()
  returnProduct$ = this.dataQueries.getReturnProducts()

  constructor(private dataQueries: DataQueriesService,
              private modalController: ModalController) { }
  ngOnDestroy() {
    this.unsubscribe$.next()
  }
  
  // returnObs$:Subscription;

  ngOnInit() {
    this.returnProduct$.pipe(
      tap((see)=>{
        console.log("ReturnProd",see);
        
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe()
  }

  async openModal(orderDetails:any){
    const modal = await this.modalController.create({
      component: ReturnProductModalComponent,
      componentProps:{
        orderDetails: orderDetails,
      },
      cssClass:'quotationModal'
    })

    modal.present()

  }

  getStatus(status:any){
      // Database has type of word in status instead of int.. (error)
      // must convert old entries to int, temp sol => add case
      // fix for new entries, convert status to its int value 
      switch(status){
        case Status.Declined:
          return "Declined"
        case Status.Canceled:
          return "Cancelled"
        case Status.Pending :
          return "Pending"
        case Status.Preparing :
          return "Preparing"
        case Status.OrderReady:
          return "OrderReady"
        case Status.OnDelivery:
          return "OnDelivery"
        case Status.Resolved:
          return "Resolved"
        // case Status.Delivered :
        //   return paymentMethod ==='pickup'? "Picked Up" : "Delivered"
        // case Status.WithReview:
        //   return paymentMethod ==='pickup'? "Picked Up" :  "Delivered"
        default:
          return "ERROR"
      
    }
  }

}
