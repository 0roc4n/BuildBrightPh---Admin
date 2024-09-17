import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, GalleryImageOptions, ImageOptions } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  galleryOptions:GalleryImageOptions={
    correctOrientation:true,
  }
  cameraOptions:ImageOptions={
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  }

  constructor(private actionSheetController: ActionSheetController) { }


  async askPhoto(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Get Photo From',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
          icon:'camera-outline'
        },
        {
          text: 'Gallery',
          role: 'gallery',
          icon:'images-outline'
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'photo-actionsheet-cancel'
        },
      ],
    });

    await actionSheet.present();
    const result = await actionSheet.onWillDismiss();
    console.log("result", result);

    if(result.role ==='camera'){
      return await this.fromCamera()
    }
    else if(result.role ==='gallery'){
      return await this.fromGallery()
    }
    else return null
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

}
