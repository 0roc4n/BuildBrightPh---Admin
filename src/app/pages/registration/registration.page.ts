import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Router } from '@angular/router';
import { ActionSheetController, IonInput, ModalController, Platform } from '@ionic/angular';
import {  Subject, takeUntil, tap } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource, GalleryImageOptions, ImageOptions } from '@capacitor/camera';
import { OtpService } from 'src/app/services/otp.service';
import { OtpModalComponent } from 'src/app/components/otp-modal/otp-modal.component';

enum UserTypes{
  Rider,
  Merchant
}


@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit,AfterViewInit ,OnDestroy{

  usertype = UserTypes
  @ViewChildren("branches") private branches!: QueryList<IonInput>;
  @ViewChild('currentMarker') currentMarker! : MapMarker
  // @ViewChild('mobileInput', { static: true }) mobileInput!: IonInput;
  // @ViewChild('currentMarker') currentMarker! : MapMarker
  // @ViewChild('map', { static: false }) map!: GoogleMap;

  // registrationForm:FormGroup = this.fb.group({
  //   userTypeId      : ['',Validators.required],
  //   userName        :
  //     this.fb.group(
  //       {
  //           first   : ['',Validators.required],
  //           middle  : ['',Validators.required],
  //           last    : ['',Validators.required]
  //       }
  //     ),
  //   email           : ['',[Validators.required,Validators.email]],
  //   mobile_no       : ['', Validators.required],
  //   password        : ['',[Validators.required, Validators.minLength(6)]],
  //   address         : this.fb.group({
  //     coordinates: this.fb.group(
  //       {
  //         lat: ['',Validators.required],
  //         lng: ['',Validators.required],
  //       }
  //     ),
  //     completeAddress: ['',Validators.required]
  //   })
  // })

  registrationForm:FormGroup = this.fb.nonNullable.group({
    profilePic: this.fb.nonNullable.control(''),
    email:this.fb.nonNullable.control('', {
      validators:[Validators.required, Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)]
    }),
    password:this.fb.nonNullable.control('', {
      validators:[Validators.required, Validators.minLength(6)]
    }),
    fullname: this.fb.nonNullable.group({
      first: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
      middleInitial: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
      last: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
    }),
    facebookPermalink: this.fb.nonNullable.control('',{
      validators: [Validators.required, Validators.pattern(/(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/)]
    }),
    storeName: this.fb.nonNullable.control('',{
      validators:[Validators.required]
    }),
    branches:this.fb.nonNullable.array([
      this.fb.nonNullable.group({
       completeAddress: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
       coordinates: this.fb.nonNullable.group({
        lat: this.fb.nonNullable.control('',{
          validators: [Validators.required]
        }),
        lng: this.fb.nonNullable.control('',{
          validators: [Validators.required]
        })
       }),
       branch_name: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      })
      })
    ]),
    ids: this.fb.nonNullable.array([this.fb.nonNullable.group({
      front: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
      back : this.fb.nonNullable.control('',{
        validators: [Validators.required]
      })
    })]),
    verified: true,
    userType: 'store',
    mobile_no : this.fb.nonNullable.control('',{
      validators:[Validators.required, Validators.pattern(/^(09|\+639)\d{9}$/)]
    })
  })

  // address?:string

  unsubscribe$ = new Subject<void>()
  geocoder = new google.maps.Geocoder()

  mapOptions:google.maps.MapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
  }

  cameraOptions:ImageOptions={
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  }

  galleryOptions:GalleryImageOptions={
    correctOrientation:true,
    limit : 1
  }
  focusBranchIndex!:number


  passwordInput = {
    type: "password",
    icon: "eye-outline"
  }

  constructor(private fb: FormBuilder,
              private authService: AuthenticationService,
              private dataq: DataQueriesService,
              private router: Router,
              private platform: Platform,
              private actionSheetController: ActionSheetController,
              private ref: ChangeDetectorRef,
              private otpService: OtpService,
              private modalController: ModalController) {}



  async ngOnInit() {
    // this.registrationForm.get('userTypeId')?.valueChanges.
    //   pipe(tap((userId: UserTypes)=>{
    //     console.log('userId',userId == UserTypes.Merchant);

    //     if(userId == UserTypes.Merchant) this.registrationForm.addControl('business_name', this.fb.control('', Validators.required))
    //     else if(this.registrationForm.get('business_name')) this.registrationForm.removeControl('business_name')
    //   })).subscribe()
  }

  ngAfterViewInit() {
    // this.map.mapClick.pipe(
    //   takeUntil(this.unsubscribe$),
    //   tap(async (clicked)=>{
    //     console.log("LatLng",clicked.latLng?.toJSON());
    //     this.currentMarker.marker?.setPosition(clicked.latLng?.toJSON())
    //     this.address = (await this.geocoder.geocode({location:clicked.latLng?.toJSON()})).results[0].formatted_address

    //     this.setAddress(clicked.latLng?.toJSON()!,this.address)
    //   })
    // ).subscribe()
    // this.getCurrentLocation()
  }


  scroll($event:any){
    const pacContainers = document.querySelectorAll('.pac-container');
    pacContainers.forEach((container) => {
      (container as HTMLElement).style.display = 'none';
    });
   }


  ngOnDestroy() {
    this.unsubscribe$.next()
  }



  signUp(){
    // if(this.registrationForm.valid){
    //   this.authService.signUp(this.registrationForm.value)
    // }
  }

  goBack(){
    this.router.navigate(['login'])
  }

  async pickAvatar(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Get Photo From..',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
        },
        {
          text: 'Gallery',
          role: 'gallery',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();

    const selection = await actionSheet.onWillDismiss()
    if(selection.role === 'camera'){
      try{
        const result = await this.fromCamera()
        this.registrationForm.get('profilePic')?.patchValue(result?.webPath)
      }
      catch(err){
        console.log("ERR",err);
      }
    }
    else if(selection.role === 'gallery') {
      try{
        const result = await this.fromGallery()
        this.registrationForm.get('profilePic')?.patchValue(result?.webPath)
      }
      catch(err){
        console.log("ERR",err);
      }
    }
    else{}
  }

  async fromCamera(){
    try{
      const image =  await Camera.getPhoto(this.cameraOptions)
       console.log("fromCamera", image);
       return {
        webPath: image.webPath
       }
    }
    catch(err){
      console.log("Err", err);
      return null
    }

  }

  async fromGallery(){
    try{
    const image = (await Camera.pickImages(this.galleryOptions)).photos[0]
    return {
      webPath: image.webPath
     }
    }
    catch(err){
      console.log("ERR",err);
      return null
    }
  }

  get branchesArray(){
    return this.registrationForm.get('branches') as FormArray
  }

  async getBranchFocus(branchIndex:number){
    this.focusBranchIndex = branchIndex

    const input = await this.branches.get(branchIndex)!.getInputElement()

    const autocomplete = new google.maps.places.Autocomplete(input,{
      componentRestrictions: {
        country:"ph",
      },
    });


   autocomplete.addListener("place_changed", () => {
      const placeLocation = autocomplete.getPlace();

      console.log("placeLocation",placeLocation);

      const coordinates = {
        lat : placeLocation.geometry?.location?.lat(),
        lng : placeLocation.geometry?.location?.lng()
      };

      (this.branchesArray.at(branchIndex) as FormGroup).get('completeAddress')?.patchValue(input.value);

      (this.branchesArray.at(branchIndex) as FormGroup).get('coordinates')?.patchValue(coordinates)
      this.ref.detectChanges()
      console.log("GOT IT",(this.branchesArray.at(branchIndex) as FormGroup).get('coordinates')?.value);
   });
  }


  removeBranch(branchIndex: number){
    this.branchesArray.removeAt(branchIndex)
  }


  async getPhoto(position:string,index?:number){
    const actionSheet = await this.actionSheetController.create({
      header: 'Get Photo From..',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
        },
        {
          text: 'Gallery',
          role: 'gallery',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();

    const selection = await actionSheet.onWillDismiss()
    if(selection.role === 'camera'){
      try{
        const result = await this.fromCamera()
        console.log("result",result);
        if(index === undefined){
          (this.registrationForm.get('license') as FormGroup).get(position)?.patchValue(result?.webPath)
        }
        else{
          ((this.registrationForm.get('ids') as FormArray).at(index) as FormGroup).get(position)?.patchValue(result?.webPath)
        }
      }
      catch(err){
        console.log("ERR",err);
      }
    }
    else if(selection.role === 'gallery') {
      try{
        const result = await this.fromGallery()
        console.log("result",result);
        if(index === undefined){
          (this.registrationForm.get('license') as FormGroup).get(position)?.patchValue(result?.webPath)
        }
        else{
          ((this.registrationForm.get('ids') as FormArray).at(index) as FormGroup).get(position)?.patchValue(result?.webPath)
        }
      }
      catch(err){
        console.log("ERR",err);
      }
    }
    else{}
    console.log("selection.role",selection.role);

  }


  get uploadIdArray(){
    return this.registrationForm.get('ids') as FormArray
  }

  mapClicked($event:any){
    console.log("$event",$event.latLng.lat(),$event.latLng.lng() );
    (this.branchesArray.at(this.focusBranchIndex).get('coordinates') as FormGroup).patchValue({
     lat: $event.latLng.lat(),
     lng: $event.latLng.lng()
    })
    this.currentMarker.marker?.setPosition($event.latLng?.toJSON())
  }


  addBranch(){
    this.branchesArray.push(this.fb.nonNullable.group({
      completeAddress: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
      coordinates: this.fb.nonNullable.group({
       lat: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
       lng: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      })
      }),
      branch_name: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      })
     }))
  }

  deleteIdRow(index:number){
    this.uploadIdArray.removeAt(index)
  }

  addIdRow(){
    this.uploadIdArray.push(this.fb.nonNullable.group({
      front: this.fb.nonNullable.control('',{
        validators: [Validators.required]
      }),
      back : this.fb.nonNullable.control('',{
        validators: [Validators.required]
      })
    }))
  }

  async submit(){
    // const pinData =await this.otpService.sendOTP(this.registrationForm.value.mobile_no)
    // const modal = await this.modalController.create({
    //   component: OtpModalComponent,
    //   componentProps:{
    //     pinData  : pinData,
    //     mobile_no: this.registrationForm.value.mobile_no
    //   }
    // })
    // modal.present()
    // const flag = await modal.onWillDismiss()
    // console.log("flag.role",flag.role);
    // if(flag.role === 'success'){
    //   this.authService.signUp(this.registrationForm.value)
    // }
    this.authService.signUp(this.registrationForm.value)
  }

  clickPasswordType(){
    if(this.passwordInput.type === 'password'){
      this.passwordInput = {
        type : 'text',
        icon : 'eye-off-outline'
      }
    }
    else{
      this.passwordInput = {
        type: "password",
        icon: "eye-outline"
      }
    }
  }


}
