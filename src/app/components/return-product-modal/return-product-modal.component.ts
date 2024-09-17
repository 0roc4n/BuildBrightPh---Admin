import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable, tap } from 'rxjs';
import { Status } from 'src/app/interfaces/status';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-return-product-modal',
  templateUrl: './return-product-modal.component.html',
  styleUrls: ['./return-product-modal.component.scss'],
  standalone:true,
  imports:[CommonModule, IonicModule, ReactiveFormsModule]
})
export class ReturnProductModalComponent  implements OnInit {

  orderDetails!:any
  returnProductDetails$ !:Observable<any>
  chatInput = this.fb.control('')
  status = Status;

  constructor(private modalController: ModalController,
              private dataQueries: DataQueriesService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.returnProductDetails$ = this.dataQueries.getReturnProductById(this.orderDetails.id).pipe(
      tap((see:any)=>{
        console.log("Details", see)
      })
    )
    console.log("orderDetails", this.orderDetails); 
  }

  dismiss(){
    this.modalController.dismiss()
  }

  chatReturnProduct(messageArray: any[]){
    if(this.chatInput.value){
      messageArray.push({
        from      : 'store',
        message   : this.chatInput.value,
        read      : false,
        timestamp : new Date().getTime()
      })
      this.dataQueries.chatReturnProduct(this.orderDetails.id, messageArray)
      this.chatInput.reset()
    }
  }

  async resolve(){
    await this.dataQueries.resolveReturn(this.orderDetails.id) 
    this.modalController.dismiss()

  }

}
