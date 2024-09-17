import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { IonInput, IonicModule, ModalController } from '@ionic/angular';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-add-branch',
  templateUrl: './add-branch.component.html',
  styleUrls: ['./add-branch.component.scss'],
  standalone: true,
  imports:[CommonModule, IonicModule, ReactiveFormsModule, GoogleMapsModule]
})
export class AddBranchComponent  implements OnInit, AfterViewInit {
  @ViewChild('address') address !: IonInput

  branchLength!:number

  addBranchForm = this.fb.group({
    completeAddress: this.fb.nonNullable.control('',{
      validators: [Validators.required]
    }),
    coordinates: this.fb.nonNullable.group({
     lat: this.fb.nonNullable.control('',{
      validators: [Validators.required]
    }) as FormControl<any>,
     lng: this.fb.nonNullable.control('',{
      validators: [Validators.required]
    }) as FormControl<any>
    }),
    branch_name: this.fb.nonNullable.control('',{
      validators: [Validators.required]
    })
   });

  mapOptions:google.maps.MapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
  }


  constructor(private modalController: ModalController,
              private fb: FormBuilder,
              private ref: ChangeDetectorRef,
              private dataQueries: DataQueriesService) { }

  ngOnInit() {
    console.log("branchLength", this.branchLength);

  }

  async ngAfterViewInit() {
    const input = await this.address.getInputElement()
    const autocomplete = new google.maps.places.Autocomplete(input,{
      componentRestrictions: {
        country:"ph",
      },
    });

    autocomplete.addListener("place_changed", () => {
      const placeLocation = autocomplete.getPlace();

      console.log("placeLocation",placeLocation);

      const coordinates = {
        lat : placeLocation.geometry!.location!.lat(),
        lng : placeLocation.geometry!.location!.lng()
      };

      this.addBranchForm.get('completeAddress')?.setValue(input.value) ;
      this.addBranchForm.get('coordinates')?.setValue(coordinates);

      this.ref.detectChanges()
   });
  }



  dismiss(){
    this.modalController.dismiss()
  }


  get coordinates(){
    const value = this.addBranchForm.get('coordinates')!.value
    if(typeof(value.lat) === 'number' && typeof(value.lng) === 'number'){
      return value as unknown as google.maps.LatLng
    }
    else return false
  }

  async addBranch(){
    await this.dataQueries.addBranch(this.branchLength, this.addBranchForm.value)
    this.modalController.dismiss()
  }


}

