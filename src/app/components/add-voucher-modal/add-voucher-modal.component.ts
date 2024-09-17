import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { Observable, map, tap } from 'rxjs';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-add-voucher-modal',
  templateUrl: './add-voucher-modal.component.html',
  styleUrls: ['./add-voucher-modal.component.scss'],
  standalone: true,
  imports:[CommonModule, IonicModule, ReactiveFormsModule]
})
export class AddVoucherModalComponent  implements OnInit {
  dateToday = this.currentDate(new Date())

  editData?:any

  addVoucherGroup = this.fb.group({
    voucherCode           : [''             , Validators.required],
    voucherExpiry         : [ this.dateToday, Validators.required],
    voucherDiscountType   : ['flat'         , Validators.required],
    voucherDiscountValue  : [''             , [Validators.required, Validators.min(1)]],
    voucherDescription    : [''             , Validators.required]
  })


  constructor(private modalController   : ModalController,
              private fb                : FormBuilder,
              private dataQueries       : DataQueriesService,
              private loadingController : LoadingController,
              private alertController   : AlertController) { }

  ngOnInit() {

    console.log("editData",this.editData);


    if(this.editData){
      this.addVoucherGroup.patchValue(
        this.editData
      )
    }


    this.addVoucherGroup.get('voucherDiscountType')!.valueChanges.pipe(
      tap((type)=>{
        if(type === 'percentage'){
          this.addVoucherGroup.get('voucherDiscountValue')!.setValidators([Validators.required, Validators.min(1),Validators.max(100)])
        }
        else if(type === 'flat'){
          this.addVoucherGroup.get('voucherDiscountValue')!.setValidators([Validators.required, Validators.min(1)])
        }
        this.addVoucherGroup.get('voucherDiscountValue')!.updateValueAndValidity()
      })
    ).subscribe()

    this.addVoucherGroup.get('voucherExpiry')!.valueChanges.pipe(
      tap((dateString)=>{
        this.addVoucherGroup.get('voucherExpiry')!.setValue(this.setMaxTime(dateString!))
      })
    ).subscribe()
  }

  dismissModal(){
    this.modalController.dismiss()
  }

  async addVoucher(){
    const message = this.editData ? 'Editing voucher...' : 'Creating voucher...'

    const loading = await this.loadingController.create({
      message: message
    })

    loading.present()
    try{
      if(this.editData){
        await this.dataQueries.editVoucher(structuredClone(this.addVoucherGroup.value), this.editData!.id)
      }
      else{
        await this.dataQueries.createVoucher(structuredClone(this.addVoucherGroup.value))
      }
      loading.dismiss()
      this.modalController.dismiss()
    }
    catch(err){
      loading.dismiss()
      console.log("ERROR", err);

      if((err as Error).message === 'exists'){
        const alert = await this.alertController.create({
          header:"Voucher code already exist",
          message: "Please use a different code",
          buttons: ["OK"]
        })
        alert.present()
      }
    }

  }


  async deleteVoucher(){
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'This voucher will be deleted',
      buttons:["Cancel",{
        text: "Confirm",
        role: 'confirm'
      }]
    })
    alert.present()
    const flag =  await alert.onWillDismiss()
    if(flag.role ==='confirm'){
      const loading = await this.loadingController.create({
        message: "Deleting voucher..."
      })
      loading.present()
      await this.dataQueries.deleteVoucher(this.editData.id)
      loading.dismiss()
      this.modalController.dismiss()
    }
  }


  currentDate(datetime: Date){
    // Get the date components
    const year           = datetime.getFullYear();
    const month          = String(datetime.getMonth() + 1).padStart(2, '0');
    const day            = String(datetime.getDate()).padStart(2, '0');

    // Get the time components
    // const hours          = String(datetimeString.getHours()).padStart(2, '0');
    // const minutes        = String(datetimeString.getMinutes()).padStart(2, '0');
    // const seconds        = String(datetimeString.getSeconds()).padStart(2, '0');

    // Get the timezone offset
    const timezoneOffset = datetime.getTimezoneOffset();
    const offsetSign     = timezoneOffset <= 0 ? '+' : '-';
    const offsetHours    = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
    const offsetMinutes  = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');

    // Format the ISO 8601 string
    return `${year}-${month}-${day}T23:59:59${offsetSign}${offsetHours}:${offsetMinutes}`;
  }


  setMaxTime(datetimeString: string){
    const datePart = datetimeString.split("T")[0];
    return datePart + "T23:59:59" + datetimeString.slice(19);
  }





}

