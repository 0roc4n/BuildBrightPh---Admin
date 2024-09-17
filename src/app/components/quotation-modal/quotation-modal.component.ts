import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonInput, IonicModule, ModalController } from '@ionic/angular';
import { Observable, combineLatest, firstValueFrom, iif, map, switchMap, tap } from 'rxjs';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-quotation-modal',
  templateUrl: './quotation-modal.component.html',
  styleUrls: ['./quotation-modal.component.scss'],
  standalone: true,
  imports:[IonicModule, CommonModule, ReactiveFormsModule]
})
export class QuotationModalComponent  implements OnInit {

  // @ViewChild('bulkInput')bulkInput!: IonInput


  orderId!:string
  clientInfo!:any; 
  storeInfo!:any;
  quotationDetails$!:Observable<any>


  
  bulkPricingGroup = this.fb.group({
  })


  chatInput= this.fb.control('')
 

  constructor(private modalController : ModalController,
              private fb              : FormBuilder,
              private dataQueries     : DataQueriesService) { }


  ngAfterViewChecked(): void {
    this.chatScrollEnd();
  } 

  getDiscountedPrice(price:any, discount:number){
    if(discount && discount > 0)
      return Number((Number(price) - (Number(price) * (discount/100))).toFixed(2));
    else return price;
  }
  

  quotationDetails:any;
  ngOnInit() {
   
    this.quotationDetails$ = this.dataQueries.getOrder(this.orderId).pipe(
      switchMap((order:any)=>{
        this.bulkPricingGroup.addControl('bulkPricingArray',
        this.fb.array(order.products.map((item:any)=>
          // item.variants 
          //   ? this.fb.array(item.variants
          //       .map((variant:any)=>this.fb.group({
          //         quantity   : [ variant.quantity         , [Validators.required, this.negativeValidator]],
          //         bulk_price : [ variant.bulk_price ?? '' , [Validators.required, this.negativeValidator]]
          //       }))) 

          //   : 
            this.fb.group({
              quantity  : [item.quantity         , [Validators.required, this.negativeValidator]],
              bulk_price: [item.bulk_price ?? '' , [Validators.required, this.negativeValidator]]
            }))))

        return combineLatest((order.products as any[]).map((item:any)=>this.dataQueries.getProductById(item.productId))).pipe(
          map((orderItems)=>{
            order.products.forEach((item:any, index:number)=>{
              order.products[index].productDetails = orderItems[index]
            })
            return order
          })
        )
      })
    )
    
    const uns$ =  this.quotationDetails$.subscribe((details)=>{
      this.quotationDetails = details;
      uns$.unsubscribe();
    })
  }



  get negativeValidator(){
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value < 0) {
        return { negativeNumber: true };
      }
      return null;
    };
  }


  async sendQuotation(){
    const quotation = structuredClone(this.quotationDetails)

    quotation.products.forEach((item:any,itemIndex:number)=>{
      delete item.productDetails
      const outerArray = (this.bulkPricingGroup.value as any).bulkPricingArray[itemIndex]
      // if(item.variants){
      //   item.variants.forEach((variant:any, varFIndex:number)=>{
      //     variant.bulk_price = outerArray[varFIndex].bulk_price
      //     variant.quantity   = outerArray[varFIndex].quantity
      //   })
      // }
      // else{
        item.bulk_price      =   outerArray.bulk_price
        item.quantity        =   outerArray.quantity
      // }
    })
  
    await this.dataQueries.sendQuotationOffer(this.orderId,quotation.products)
    this.modalController.dismiss()
  }

  getStatus(status:number){
    switch(status){
      case Status.Pending:
        return 'Pending';
      case Status.Declined:
        return 'Declined';
      case Status.Offered:
        return 'Offered';
      case Status.Resolved:
        return 'Approved';
      default:
        return 'Error Getting Status';
    }
  }

  chatScrollEnd(){
    if(document.querySelector('#chatScroll'))
      document.querySelector('#chatScroll')!.scrollTop = document.querySelector('#chatScroll')!.scrollHeight;
  }
  notPending(quotationDetails:any){
    if(quotationDetails!=null)
      return quotationDetails.quotation.status != Status.Pending && quotationDetails.quotation.status != Status.Offered;
    else  
      return true;
  }

  sendQuotationMessage(chatArr:any[]){
    if(this.chatInput.value){
      if(chatArr){
        chatArr.push({
          from      : 'store',
          message   : this.chatInput.value,
          timestamp : new Date().getTime(),
          read      : false
        })
      }
      else{
        chatArr = []
        chatArr.push({
          from      : 'store',
          message   : this.chatInput.value,
          timestamp : new Date().getTime(),
          read      : false
        })
      }
      
      this.dataQueries.sendQuotationMessage(this.orderId,chatArr)
      this.chatInput.reset()
    }
  }





  dismissModal(){
    this.modalController.dismiss()
  }



}
