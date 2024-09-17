import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { FilePickerComponent } from "../file-picker/file-picker.component";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { CommonModule } from '@angular/common';
import { iif } from 'rxjs';

@Component({
    selector: 'app-add-category-modal',
    templateUrl: './add-category-modal.component.html',
    styleUrls: ['./add-category-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, FilePickerComponent, ReactiveFormsModule, CommonModule]
})
export class AddCategoryModalComponent  implements OnInit {
  category?:any

  addCategoryForm:FormGroup = this.fb.group({
    icon : this.fb.array([], this.minLengthArray(1)),
    image : this.fb.array([], this.minLengthArray(1)),
    name   : [null, Validators.required],
    subcategories : this.fb.array([])
  })

  constructor(private fb: FormBuilder,
              private modalController: ModalController,
              private dataQueries: DataQueriesService,
              private loadingController: LoadingController,
              private alertController: AlertController) { }

  ngOnInit() {
    if(this.category){

      this.addCategoryForm.patchValue({
        name : this.category.name
      });
      (this.addCategoryForm.get('image') as FormArray).push(this.fb.control(this.category.image));
      if(this.category.icon){
        (this.addCategoryForm.get('icon') as FormArray).push(this.fb.control(this.category.icon))
      }
      this.subcategories = this.category.subcategories ?? [];
      if(this.subcategories.length){
        for(let subcat  of this.subcategories){
          (this.addCategoryForm.get('subcategories') as FormArray).push(this.fb.group({
            id : [subcat.id],
            name: [subcat.name ,  Validators.required]
          }))
        }
      }
   
    }
  }

  getSubForm(){
    return this.addCategoryForm.get('subcategories') as FormArray;
  }

  getFormGroup(index:number){
    return this.getSubForm().get(index.toString()) as FormGroup;
  }

  updatesubInput(event:any){
    this.submittedInvalid = false
    this.subcategoryInput = event.target.value;
    
  }
  
  isInvalid(){
    return this.subcategoryInput.trim() == '';
  }
  subcategoryInput:string ='';

  subcategories:any[] = [];
  submittedInvalid = false;
  addSubcategory(){
    this.getSubForm().push(this.fb.group({
      id : [null],
      name : ['', Validators.required]
    }))
    // if(this.isInvalid()){
    //   this.submittedInvalid = true;
    //   return;
    // }
    // this.subcategories.push({
    //   name:this.subcategoryInput.trim()
    // })
    // this.subcategoryInput = '';
  }
  removeSubcategory(index:number){
    this.getSubForm().removeAt(index);
    // this.subcategories.splice(index, 1);
  }

  async submit(){
    // console.log("addCategoryForm",this.addCategoryForm.value);

    const payload = this.addCategoryForm.value;
    const loader = await this.loadingController.create({
      message: "Sending..."
    })
    loader.present()

    try{
      await this.dataQueries.createCategory(payload,this.category?.id)
      loader.dismiss()
      this.modalController.dismiss()
    }
    catch(err){
      this.modalController.dismiss()
      console.log("Error", err);
      loader.dismiss()
    }
    // try{
    //   if(this.checkCategoryIndex){
    //     console.log("PAYLOAD EDIT", payload);
    //     await this.dataQueries.categoriesRef(`/${userId}`).set(`/${this.categoryIndex}`,payload)
    //     const cat = JSON.parse(sessionStorage.getItem('fullCategories')!)
    //     cat[this.categoryIndex!] = {
    //       ...payload,
    //       productItems: cat[this.categoryIndex!].productItems
    //     }
    //     sessionStorage.setItem('fullCategories',JSON.stringify(cat))
    //     loader.dismiss()
    //     this.modalController.dismiss()
    //   }
    //   else{
    //     const catLength = JSON.parse(sessionStorage.getItem('fullCategories')!).length
    //     await this.dataQueries.categoriesRef(`/${userId}`).set(`/${catLength}`,payload)
    //     const cat = JSON.parse(sessionStorage.getItem('fullCategories')!)
    //     cat.push({
    //       ...payload,
    //       productItems:[]
    //     })
    //     sessionStorage.setItem('fullCategories',JSON.stringify(cat))
    //     loader.dismiss()
    //     this.modalController.dismiss()
    //     //
    //   }
    // }
    // catch(err){
    //   loader.dismiss()
    //   const alert = await this.alertController.create({
    //     header: "Spmething went wrong",
    //     message:"Please contact developers for more info.",
    //     buttons:["OK"]
    //   })
    //   alert.present()
    //   await alert.onWillDismiss()
    //   this.modalController.dismiss()
    // }


  }

  get image(){
    return this.addCategoryForm.get('image')?.value
  }

  dismissModal(){
    this.modalController.dismiss()
  }

  // get checkCategoryIndex(){
  //   return this.categoryIndex !== undefined
  // }


  minLengthArray(min: number) {
    return (c: AbstractControl): {[key: string]: any }| null => {
        if (c.value.length >= min) return null;
        return { 'minLengthArray': {valid: false }};
    }
  }
}
