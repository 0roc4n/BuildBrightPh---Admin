import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, tap } from 'rxjs';
import { AddVoucherModalComponent } from 'src/app/components/add-voucher-modal/add-voucher-modal.component';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.page.html',
  styleUrls: ['./vouchers.page.scss'],
})
export class VouchersPage implements OnInit {

  // vouchers$ = this.dataQueries.getVouchers()

  validVouchers$ = new BehaviorSubject<any[]>([])
  expiredVouchers$  = new BehaviorSubject<any[]>([])

  tab:any = 0
  currentDate = new Date()

  constructor(private modalController: ModalController,
              private dataQueries: DataQueriesService) { }

  ngOnInit() {
    this.dataQueries.getVouchers().pipe(
      tap((vouchers:any[])=>{
        const valid :any[] = []
        const expired: any[] = []

        vouchers.forEach((voucher)=>{
          if(new Date(voucher.voucherExpiry).getTime() >= this.currentDate.getTime()){
            valid.push(voucher)
          }
          else{
            expired.push(voucher)
          }
        })
        this.validVouchers$.next(valid)
        this.expiredVouchers$.next(expired)
      })
    ).subscribe()

  }

  async addVoucher(editData?: any){
    const modal = await this.modalController.create({
      component : AddVoucherModalComponent,
      cssClass  : 'quotationModal',
      componentProps: {
        editData: editData
      }
    })
    modal.present()
  }

  changeTab($event:any){
    console.log("$event.detail.value",$event.detail.value);

    this.tab = parseInt($event.detail.value)
  }



}
