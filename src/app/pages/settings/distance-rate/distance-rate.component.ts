import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, tap } from 'rxjs';

@Component({
    selector: 'app-distance-rate',
    templateUrl: './distance-rate.component.html',
    styleUrls: ['./distance-rate.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent, ReactiveFormsModule]
})
export class DistanceRateComponent  implements OnInit {

  pricePerDistance$ = this.dataQueries.pricePerDistance$

  distanceRateForm = this.fb.group({
    distanceRateArray: this.fb.array([])
  })

  toggleEditIndex: number|null = null

  constructor(private dataQueries     : DataQueriesService,
              private fb              : FormBuilder,
              private alertController : AlertController) { }

  ngOnInit() {
    this.pricePerDistance$.pipe(
      map((ppr:any)=> ppr.sort((a:any, b:any) => a.distance - b.distance)),
      tap((ppr:any)=>{
        const formArray = this.fb.array([])
        ppr.forEach((rate:any)=>{
          (formArray  as FormArray).push(this.fb.group(
            {
              distance : this.fb.nonNullable.control(rate.distance, Validators.required),
              price: this.fb.nonNullable.control(rate.price, Validators.required),
              id: this.fb.nonNullable.control(rate.id)
            }
          ))
        })
        this.distanceRateForm.setControl('distanceRateArray',formArray)
      })
    ).subscribe()
  }


  get distanceRatArray(){
    return this.distanceRateForm.get('distanceRateArray') as FormArray
  }


  async addRate(){
    const alert = await this.alertController.create({
      header: "Add Rate",
      inputs:[
        {
          placeholder: 'Distnance...',
          name:'distance',
        },
        {
          placeholder: 'Price...',
          name:'price',
        }
      ],
      buttons: ["Cancel",{
        text: "Ok",
        role:'ok'
      }]
    })
    alert.present();

    const flag = await alert.onWillDismiss()

    if(flag.role === 'ok'){
      const numericRegex = /^\d+$/;

      if((!(flag.data.values.distance ||flag.data.values.price)) || !numericRegex.test(flag.data.values.distance) || (!numericRegex.test(flag.data.values.price) && !(flag.data.values.price ==='too_far')) ){
        await this.invalidAlert()
        this.addRate()
      }
      else if(this.checkDistanceExist(parseInt(flag.data.values.distance))){
        const alert = await this.alertController.create({
          header:`Pricing at ${flag.data.values.distance} already exist.`,
          buttons:["OK"]
        })

        alert.present()
        await alert.onWillDismiss()
        this.addRate()
      }
      else if(flag.data.values.price ==='too_far' && this.tooFarExist() ){
        this.tooFarAlreadyExistAlert()
      }
      else if(this.checkGreaterThanTooFar(flag.data.values.distance)){
        const alert = await this.alertController.create({
          header:"Greater than too_far flag!",
          message: 'Added distance is greater than the current too_far flag. Please check your input again.',
          buttons:["Ok"]
        })
        alert.present()
        await alert.onWillDismiss()
        this.addRate()
      }
      else{
        const price    = parseInt(flag.data.values.price)
        this.dataQueries.addRate(parseInt(flag.data.values.distance),  Number.isNaN(price) ? flag.data.values.price : price)
      }
    }
  }

  checkGreaterThanTooFar(distance:number){
    const too_far = this.distanceRatArray.value.findIndex((ppr:any)=>ppr.price === 'too_far')
    console.log(" ",distance);
    console.log("too_far",too_far);
    if(too_far>=0){
      console.log("toofar",this.distanceRatArray.at(too_far)!.value);
      if(distance >  this.distanceRatArray.at(too_far)!.value.distance){
        return true
      }
      else return false
    }
    else return false
  }

  tooFarExist(index?:number){
    if(typeof(index) === 'number'){
      return this.distanceRatArray.value.reduce((count:number, current:any)=>{
        if(current.price  === 'too_far'){
          count++
        }
        return count
      },0) > 1
    }
    else  return this.distanceRatArray.value.findIndex((rate:any)=> rate.price  === 'too_far') >= 0
  }

  checkDistanceExist(distance:number){
    return this.distanceRatArray.value.findIndex((ppr:any)=>ppr.distance === distance) >=0
  }

  async tooFarAlreadyExistAlert(){
    const alert = await this.alertController.create({
      header:'Too Far flag exist!',
      message: 'Edit or delete the too far flag in order for you to create another one.',
      buttons:["OK"]
    })

    alert.present()
  }

  async invalidAlert(){
    const alert = await this.alertController.create({
      header:'Invalid',
      message:'Please try again',
      buttons:["Ok"]
    })

    alert.present()
    await alert.onWillDismiss()
  }

  async distanceAlreadyExistAlert(){}

  async deleteRate(rateId:string){

    console.log("rateId", rateId);


    const alert = await this.alertController.create({
      header:"Are you sure?",
      message:"This rate will be deleted.",
      buttons:["Cancel",{
        text: "Ok",
        role: 'ok'
      }]
    })

    alert.present()

    if((await alert.onWillDismiss()).role ==='ok'){
      this.dataQueries.deleteRate(rateId)
    }
  }

  toggleEdit(index:number|null){
    this.toggleEditIndex = index
  }

  cancelEdit(index:number){
    this.distanceRatArray.at(index).reset()
    this.toggleEditIndex = null
  }


  async saveRate(formValue:any, index:number){
    const numericRegex = /^\d+$/;
    if(!numericRegex.test(formValue.distance) || (!numericRegex.test(formValue.price) && !(formValue.price ==='too_far'))){
      this.invalidAlert()
    }
    else if(formValue.price ==='too_far' && this.tooFarExist(index)){
      this.tooFarAlreadyExistAlert()
    }
    else{
      await this.dataQueries.updateRate(formValue)
      this.toggleEditIndex = null
    }



  }



}
