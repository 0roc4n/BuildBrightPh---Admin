import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { IonicModule, ModalController } from '@ionic/angular';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-user-verification-action',
  templateUrl: './user-verification-action.component.html',
  styleUrls: ['./user-verification-action.component.scss'],
  standalone:true,
  imports:[IonicModule, CommonModule,GoogleMapsModule]
})
export class UserVerificationActionComponent  implements OnInit {

  userData!:any

  clickedAddress:google.maps.LatLng|null = null

  mapOptions:google.maps.MapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
  }


  constructor(private dataQueries: DataQueriesService,
              private modalController: ModalController) { }

  ngOnInit() {
    console.log("userData",this.userData);
  }

  dismiss(){
    this.modalController.dismiss()
  }

  async verifyUser(){
    await this.dataQueries.verifyUser(this.userData.id)
    this.modalController.dismiss()
  }


  goToLink(url: string){
    window.open(url, "_blank");
  }

  addressClick(latLng:google.maps.LatLng){
    this.clickedAddress = latLng
  }
}
