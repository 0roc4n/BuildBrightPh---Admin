import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { Camera, CameraResultType, GalleryImageOptions, GalleryPhoto } from '@capacitor/camera';
import { IonicModule, Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';

@Component({
  selector: 'app-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss'],
  standalone: true,
  imports:[IonicModule, CommonModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]

})
export class FilePickerComponent  implements OnInit {

  @Input() fcName!:string
  @Input() single?:Boolean
  @Input() labelTag?:string
  constructor(private fb       : FormBuilder,
              private fgDir    : FormGroupDirective,
              private platform : Platform,
              ) { }

  ngOnInit() {
    // console.log(this.fgDir.form.get(this.fcName) )
  }

  get imageFormArray(){
    return this.fgDir.form.get(this.fcName) as FormArray
  }


  async pickImage(){
    let galleryOpt: GalleryImageOptions ={
      limit: this.single ? 1 : 5
    }
    const image_input = (await Camera.pickImages(galleryOpt)).photos
    const images_to_push:any[] = image_input

    if (this.platform.is('hybrid')) {
      const results = await Promise.all(image_input.map((image)=>
        Filesystem.readFile({
          path: image.path!,
          encoding: Encoding.UTF8
        })
      ))
      images_to_push.map((img, index)=>img.binary = results[index])

    }
    else{
      const fetching = await Promise.all(image_input.map(img=>fetch(img.webPath!)))
      const blobs = await Promise.all(fetching.map((fetchedImg)=>fetchedImg.blob()))

      blobs.forEach((blob, index)=>{
        // var reader = new FileReader();
        // reader.readAsDataURL(blob);
        // reader.onloadend = function() {
        //   if(typeof(reader.result) === 'string'){
        //     images_to_push[index].base64 = reader.result.split(',')[1];
        //   }
        // }
        images_to_push[index].binary = blob
      })
    }
    console.log("images_to_push",images_to_push);
    if(this.single){
      if(this.imageFormArray.value.length > 0){
        this.imageFormArray.at(0).patchValue(images_to_push[0])
      }
      else this.imageFormArray.push(this.fb.control(images_to_push[0]))
      // (this.fgDir.form.get(this.fcName)! as FormArray).at(0).patchValue(this.fb.control(images_to_push[0]))
      // .push(this.fb.control(images_to_push[0]))
    }
    else{
      images_to_push.forEach((img)=>{
        (this.fgDir.form.get(this.fcName)! as FormArray).push(this.fb.control(img))
      }
    )
    }

    console.log("images_to_push",this.fgDir.form.get(this.fcName)!.value);
  }

  deleteImage(index:number){
    (this.fgDir.form.get(this.fcName) as FormArray).removeAt(index)
  }

  // get formControlVal(){
  //   return this.fgDir.form.get(this.fcName)?.value
  // }

}
