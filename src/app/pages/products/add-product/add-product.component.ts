import { CommonModule, CurrencyPipe} from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule,  Validators } from '@angular/forms';
import { AlertController, IonSelect, IonicModule, LoadingController, PopoverController } from '@ionic/angular';
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { FilePickerComponent } from "../../../components/file-picker/file-picker.component";
import { Subject, iif, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { HelperService } from 'src/app/services/helper.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/interfaces/product';

enum Operation{
  Add,
  Edit
}

interface Titles{
  title       : string,
  operation   : Operation,
  buttonTitle : string,
}


@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrls: ['./add-product.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent, ReactiveFormsModule, ScrollbarDirective, FilePickerComponent],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddProductComponent  implements OnInit,OnDestroy {
  // @ViewChild('categorySelect') categorySelect!: IonSelect;

  unsubscribe = new Subject<void>()

  frontTitles: Titles = {
    title       : "Add Product",
    operation   :  Operation.Add,
    buttonTitle : "Save"
  }

  editId?:string

  deleted?:any

  product?:any

  selected: { [key: string]: boolean } = {};
  variations: string[]=[];
  selectedSegment: string|null = null;
  sizePriceEntries : any[] = []
  editing = false;
  itemVariants = 1;

  productFormSwitcher = {
    single: this.fb.group([]),
    multiVariant:this.fb.group([]),
    singleVariant:this.fb.group([]),
  };

  addProductForm:FormGroup  = this.fb.group({
    name        : this.fb.nonNullable.control('',Validators.required),
    category    : this.fb.nonNullable.control('',Validators.required),       
    subcategory : [{value:null, disabled:true}],       
    item_code   : this.fb.nonNullable.control('',Validators.required),       
    description : this.fb.nonNullable.control('',Validators.required),
    // in_stock : this.fb.nonNullable.control('',Validators.required),
    // price : this.fb.nonNullable.control('',Validators.required),
    // images : this.fb.nonNullable.array([],this.minLengthArray(3)),
    discount    : this.fb.nonNullable.control(''),
    metaKeyword : this.fb.nonNullable.control('',Validators.required),
    // variants    : this.fb.group({}),
  })

  types:FormGroup = this.fb.group({
    variantType : this.fb.nonNullable.array([
      this.fb.group({
        name : this.fb.nonNullable.control('',Validators.required),
        price : this.fb.nonNullable.control('',Validators.required),
      })
    ])
  })

  notNullValidator(control: AbstractControl): { [key: string]: any } | null {
    return control.value !== null ? null : { 'isNull': true };
  }
  withVariations = false;
  
  
  withVariant: FormControl = this.fb.control(false)

  categories$ = this.dataQueries.getCategories(this.unsubscribe)

  constructor(
               private fb: FormBuilder,
               private cd: ChangeDetectorRef,
               private actRoute: ActivatedRoute,
               private dataQueries : DataQueriesService,
               private loadingController: LoadingController,
               private alertController: AlertController,
               private productService: ProductService,
               private popoverController: PopoverController,
               private router: Router,
               ) {}


  async ngOnDestroy() {
    this.unsubscribe.next()
    if(await this.popoverController.getTop()) this.popoverController.dismiss()
  }

  subcategories:any[] = []

  updateSubcategories(categories:any[] , load:boolean = false){
   if(!load){
    this.addProductForm.get('subcategory')?.patchValue (null);
   }
    (this.addProductForm.get('subcategory') as FormControl).disable();
    const catId =  this.addProductForm.get('category')!.value;
    const found = categories.find((category)=> category.id == catId);
    this.subcategories = found.subcategories ?? [];
    if(this.subcategories.length > 0) {
      (this.addProductForm.get('subcategory') as FormControl).enable();
    }
  }

  deepCopyFormGroup(original: FormGroup): FormGroup {
    const copiedForm = this.fb.group({});

    // Iterate over the controls in the original form group
    Object.keys(original.controls).forEach((controlName) => {
      // if(controlName)
      const control = original.get(controlName) as AbstractControl;
    
      if (control instanceof FormGroup) {
        copiedForm.addControl(controlName,
          this.deepCopyFormGroup(control)
        );
      }else if(control instanceof FormArray){
        const formArray = this.fb.array<FormGroup|FormControl>([]);
        for(let arControl of control.controls){
          if(arControl instanceof FormGroup){
            const copiedControl = this.deepCopyFormGroup(arControl);
            formArray.push(copiedControl)
          }else{
            const copiedControl = this.fb.control({ value: arControl.value, disabled: arControl.disabled }, arControl.validator);
            formArray.push(copiedControl)
          }
        }
        copiedForm.addControl(controlName,
          formArray
        );
      }
      else{
         // Create a new control with the same value and validators
        const copiedControl = this.fb.control({ value: control.value, disabled: control.disabled }, control.validator);
        copiedForm.addControl(controlName, copiedControl);
      }
    });

    return copiedForm;
  }
  ngOnInit() {
    this.withVariant.valueChanges.subscribe((flag)=>{
      if(flag){
      
        if(this.addProductForm.get('variants') == null){
          this.productFormSwitcher.single = this.deepCopyFormGroup(this.addProductForm);
        }
      
        // console.log('In here NO varaitns', this.addProductForm);
          if(Object.keys(this.productFormSwitcher.singleVariant.value).length <= 0){
            this.addProductForm.removeControl('price')
            this.addProductForm.removeControl('in_stock')
            this.addProductForm.removeControl('images')
            this.addProductForm
              .addControl('variants', this.fb.group({}))
        
          }
          this.segmentChanged('single', false,true)
          this.withVariations = true;

          
      }
      else{
        this.selectedSegment = null;
        if(this.addProductForm.get('subvariant_type')){
          // multviatiant
          this.productFormSwitcher.multiVariant = this.deepCopyFormGroup(this.addProductForm);
        }else{
          // single variant
          // console.log('In here', this.addProductForm);
       
          this.productFormSwitcher.singleVariant = this.deepCopyFormGroup(this.addProductForm);
         
        }
        if(Object.keys(this.productFormSwitcher.single.value).length > 0){
          this.addProductForm = this.deepCopyFormGroup(this.productFormSwitcher.single);
        }else{
          this.addProductForm.addControl('price', this.fb.nonNullable.control('', Validators.required))
          this.addProductForm.addControl('in_stock',this.fb.nonNullable.control('',[Validators.required, Validators.min(1)]))
          this.addProductForm.addControl('images',this.fb.nonNullable.array([],this.minLengthArray(3)))
          this.addProductForm.removeControl('variants')
          this.addProductForm.removeControl('variant_type')
          this.addProductForm.removeControl('subvariant_type')
        }
        this.withVariations = false;
        this.cd.detectChanges()
      }
    })

    this.actRoute.queryParams.subscribe({
      next:async (params)=> {

        if(params['product']){
          
          const product = JSON.parse(params['product'])
    
          
          this.editId = product.id
          
          this.frontTitles ={
            title: `Edit Product ${product.name}`,
            operation: Operation.Edit,
            buttonTitle: 'Edit'
          }

          this.addProductForm.patchValue({
            name          : product.name,
            category      : product.category,
            subcategory   : product.subcategory,
            item_code     : product.item_code,
            description   : product.description,
            discount      : product.discount,
            metaKeyword   : product.metaKeyword,
          })
          const $obs = this.categories$.subscribe(data=>{
            this.updateSubcategories(data, true);
            $obs.unsubscribe();
          })
          if(product.variants){
            this.addProductForm.addControl('variants', this.fb.group({}))
            const default_variant = product.variants.color ? 'Color' : product.variants.colors? 'Colors' : 'Size'
            this.addProductForm.addControl('variant_type', this.fb.nonNullable.control(product.variant_type ?? default_variant, Validators.required))
            if(product.variants.type){
              this.addProductForm.addControl('subvariant_type', this.fb.nonNullable.control(product.subvariant_type ?? 'Type', Validators.required))
            }
            this.withVariant.patchValue(true,
              {
              emitEvent:false
              }
            )
          }else{
            this.addProductForm.addControl('price', this.fb.nonNullable.control(product.price, Validators.required))
            this.addProductForm.addControl('in_stock',this.fb.nonNullable.control(product.in_stock,[Validators.required, Validators.min(1)]))
            this.addProductForm.addControl('images',this.fb.nonNullable.array(product.images.map((img:any)=>this.fb.nonNullable.control(img)),this.minLengthArray(3)))
            this.withVariant.patchValue(false,
              {
              emitEvent:false
              }
            )
            
          }

          this.product = product

          if(this.product.variants){

            if(this.product.variants.size || this.product.variants.color){
              // if(this.selectedSegment === 'single'){
                for (const variantType in this.product.variants) {
                  this.variations = [variantType];
                  if(this.variations.length > 0){
                    this.onVariationsChange(variantType, true)
                  }
                }
              // }
              this.segmentChanged('single', true)
              this.productFormSwitcher.singleVariant = this.deepCopyFormGroup( this.addProductForm);
              // console.log('singke',this.product);
            }
            else{
              if(this.product.variants){
                if(this.product.variants.type){
                  await this.product.variants.type.map((t: any) => {
                    this.setSizePrice(t.name, t.price)
                  })
                  // this.addProductForm.addControl('subvariant_type', this.fb.nonNullable.control(this.product.subvariant_type, Validators.required))
                }
                if(this.product.variants.colors){
                  this.itemVariants = this.product.variants.colors.length ;
                  // this.addProductForm.addControl('variant_type', this.fb.nonNullable.control(this.product.variant_type, Validators.required));
                  (this.addProductForm.get('variants') as FormGroup).addControl('colors', this.fb.array([]));
                  this.product.variants.colors.map((c: any, i: any) => {
                    var colorData = this.multiFormGroup();
                    // console.log(c);
                    colorData.patchValue(c);
                    // syncying the names of sub variants
                    this.typesSync = c.types.map((t:any)=>({name:t.name}))
          
                    const variantGroup = this.fb.group({
                      variant_name: this.fb.control(c.variant_name, Validators.required),
                      images: this.fb.array(c.image.map((img: any) => this.fb.nonNullable.control(img), this.minLengthArray(1))),
                      types: this.fb.array(
                        c.types.map((t: any) => 
                          this.fb.group({
                            name : this.fb.control(t.name, [Validators.required, Validators.min(0)]),
                            in_stock: this.fb.control(t.in_stock, [Validators.required, Validators.min(0)]),
                            price: this.fb.control(t.price, [Validators.required, Validators.min(0)]),
                          })
                        )
                      )
                    });
                    // console.log(variantGroup);
                    const colorsFormArray = (this.addProductForm.get('variants.colors') as FormArray);
                    colorsFormArray.push(variantGroup);
                    
                    // console.log(this.addProductForm.value);
                  })
                }
                this.productFormSwitcher.multiVariant = this.deepCopyFormGroup( this.addProductForm);
              
                this.segmentChanged('multiple',true)
              }
              // console.log('multiple',this.product);
            } 
            
            // const variantsFormGroup = this.addProductForm.get('variants') as FormGroup;

            // if(this.product.variants.size){
            //   this.selectedSegment = 'single'
            //   this.onVariationsChange('size')
            // }

            // for (const variantType in this.product.variants) {
            //   this.segmentChanged('single')
            //   this.variations = [variantType];
            //   if(this.variations.length > 0){
            //     this.onVariationsChange(variantType)
            //   }
            // }
            
          }
          else{
            // this.addProductForm.addControl('price', this.fb.nonNullable.control(this.product.price, Validators.required))
            // this.addProductForm.addControl('in_stock',this.fb.nonNullable.control(this.product.in_stock,[Validators.required, Validators.min(1)]))
            // this.addProductForm.addControl('images',this.fb.nonNullable.array(this.product.images.map((img:any)=>this.fb.nonNullable.control(img)),this.minLengthArray(3)))
            this.addProductForm.removeControl('variants')
            this.productFormSwitcher.single = this.deepCopyFormGroup( this.addProductForm);
            this.cd.detectChanges()
          }
        }
        else if(params['categoryId']){
          // this.onVariationsChange('size');
          this.addProductForm.patchValue({
            category: params['categoryId']
          })
          const $obs = this.categories$.subscribe(data=>{
            this.updateSubcategories(data, true);
            $obs.unsubscribe();
          })
          this.addProductForm.addControl('price', this.fb.nonNullable.control('', Validators.required))
          this.addProductForm.addControl('in_stock',this.fb.nonNullable.control('',[Validators.required, Validators.min(0)]))
          this.addProductForm.addControl('images',this.fb.nonNullable.array([],this.minLengthArray(3)))
        }else{
          this.addProductForm.addControl('price', this.fb.nonNullable.control('', Validators.required))
          this.addProductForm.addControl('in_stock',this.fb.nonNullable.control('',[Validators.required, Validators.min(0)]))
          this.addProductForm.addControl('images',this.fb.nonNullable.array([],this.minLengthArray(3)))
          // this.onVariationsChange('size');
        }
      }
    })

   
  }

  getVariantArray(variantType: string): FormArray {
    return this.addProductForm.get(`variants.${variantType.toLowerCase()}`) as FormArray;
  }

  addVariant(variantType: string) {
    const variantArray = this.getVariantArray(variantType);
  
    variantArray.push(
      this.fb.group({
        variant_name: this.fb.control('', Validators.required),
        price: '',
        in_stock: this.fb.control('', [Validators.required, Validators.min(0)]),
        images: this.fb.array([], this.minLengthArray(1))
      })
    );
    this.cd.detectChanges();
  }

deleteVariant(index: number, variantType: string) {
  const alert = this.alertController.create({
    header: 'Remove Variant?',
    message: 'Are you sure you want to delete this variant?',
    buttons: [
      {
        text: 'No, Cancel',
        role: 'cancel',
      },
      {
        text: 'Yes, Delete',
        handler: () => {
          const variantArray = this.getVariantArray(variantType);
          if(variantArray.length > 0) {
            variantArray.removeAt(index);
          } else {
            this.onVariationsChange(variantType)
          }    
          // delete this.sizePriceEntries[index]
          this.itemVariants -=1 ;
          this.cd.detectChanges();
        },
      },
    ],
    
  }).then((confirmAlert) => {
    confirmAlert.present();
  });
}

deleteType(typeIndex:number) {
  // console.log(typeIndex);
 this.alertController.create({
    header: 'Remove Subvariant?',
    message: 'Are you sure you want to delete this subvariant?',
    buttons: [
      {
        text: 'No, Cancel',
        role: 'cancel',
      },
      {
        text: 'Yes, Delete',
        handler: () => {
          const variantArray = this.getVariantArray('colors');
          for(let variant of variantArray.controls){
            (variant.get('types')! as FormArray).removeAt(typeIndex);
           
          }
          this.typesSync.splice(typeIndex,1);
          // delete this.sizePriceEntries[index]
          // this.itemVariants -=1 ;
          this.cd.detectChanges();
        },
      },
    ],
    
  }).then((confirmAlert) => {
    confirmAlert.present();
  });
}


  minLengthArray(min: number) {
    return (c: AbstractControl): {[key: string]: any }| null => {
        if (c.value.length >= min) return null;
        return { 'minLengthArray': {valid: false }};
    }
  }

  variantFromGroup(index: number, variantType: string): FormGroup {
    const variantArray = this.getVariantArray(variantType);
    return variantArray.at(index) as FormGroup;
  }

  variantsGroup(){
    // console.log(this.addProductForm.get('variants') as FormGroup)
    return this.addProductForm.get('variants') as FormGroup;
  }
  

  createVariantGroup(): FormGroup {
    return this.fb.group({
      variant_name: this.fb.control('', Validators.required),
      price: '',
      in_stock: this.fb.control('', [Validators.required, Validators.min(1)]),
      images: this.fb.array([], this.minLengthArray(1))
    });
  }

  imageValid(formGroup:FormGroup){
    return formGroup.get("images")!.valid
  }


  variantImagesArray(index: number, variantType: string): FormArray {
    const variantGroup = this.variantFromGroup(index, variantType);
    return variantGroup.get('images') as FormArray;
  }
  
  async submit(){
    
    const payload:any = this.addProductForm.value
    // console.log("Payload", payload);


    const loading = await this.loadingController.create({
      message: "Sending Data..."
    })

    loading.present()
    try{
      const flag =  await this.dataQueries.createProduct(payload, this.editId);
      if(flag){
        if(this.editId){
          window.history.back();
        }
        else{
          this.resetForm()
        }
        loading.dismiss()
        this.successAlert()
      }
      else loading.dismiss()
   
    }
    catch(err){
      const alert = await this.alertController.create({
        header:'Something went wrong...',
        message:'Please contact developers for more info',
        buttons: ["OK"]
      })
      console.log("err",err);

      loading.dismiss()
      alert.present()
    }
  }

  async successAlert(){
    // console.log("SUCCESS");

    const successAlert = await this.alertController.create({
      header:'Success!',
    })
    successAlert.present()
    const timeout = setTimeout(()=>{
      successAlert.dismiss()
      clearTimeout(timeout)
    }, 500)
  }


  resetForm(){
    this.addProductForm =  this.fb.group({
      name        : this.fb.nonNullable.control('',Validators.required),
      category    : this.fb.nonNullable.control('',Validators.required),
      subcategory : [null],
      item_code   : this.fb.nonNullable.control('',Validators.required),
      description : this.fb.nonNullable.control('',Validators.required),
      discount    : this.fb.nonNullable.control(''),
      metaKeyword : this.fb.nonNullable.control('',Validators.required),
    })
    this.subcategories = [];
    this.addProductForm.addControl('price', this.fb.nonNullable.control('', Validators.required))
    this.addProductForm.addControl('in_stock',this.fb.nonNullable.control('',[Validators.required, Validators.min(1)]))
    this.addProductForm.addControl('images',this.fb.nonNullable.array([],this.minLengthArray(3)))
    this.withVariant.patchValue(false,{
      emitEvent:false
    })

    this.variations.length = 0;
    this.sizePriceEntries.length = 0
    // console.log("addProductForm",this.addProductForm.value);

  }

  async onVariationsChange(optionName: any, load?:boolean) {
    if(!load){
      this.selected[optionName] = false;
      this.variations = [];
    }
    this.selected[optionName] = !this.selected[optionName];
    // console.log(this.selected)          
    
    if(this.editId == null || this.editId == undefined){
      if (this.selected[optionName]) {

        Object.keys(this.selected).forEach((key) => {
          if (key !== optionName) {
            this.selected[key] = false;
            (this.addProductForm.get('variants') as FormGroup).removeControl(key);
          }
        });

        if (!this.variations.includes(optionName)) {
          this.variations= [optionName];
      
          // console.log(this.variations)
          const variantGroup = this.createVariantGroup();
          (this.addProductForm.get('variants') as FormGroup).addControl(optionName, this.fb.array([variantGroup]));
        }
      } 
      // else {
      //   const index = this.variations.indexOf(optionName);
      
      //   if (index === -1) {
      //     return;
      //   }
      
      //   const alert = await this.alertController.create({
      //     header: 'Delete ' + optionName + '?',
      //     message: 'Are you sure you want to delete this variant?',
      //     buttons: [
      //       {
      //         text: 'Cancel',
      //         role: 'cancel',
      //         handler: () => {
      //           this.selected[optionName] = !this.selected[optionName];
      //         },
      //       },
      //       {
      //         text: 'Delete',
      //         handler: () => {
      //           (this.addProductForm.get('variants') as FormGroup).removeControl(optionName);
      //         },
      //       },
      //     ],
      //   });
      
      //   await alert.present();
      // }
      
    } else {
      //If the selected is already included in the array
      if(this.selected[optionName]){

        Object.keys(this.selected).forEach((key) => {
          if (key !== optionName) {
            this.selected[key] = false;
            (this.addProductForm.get('variants') as FormGroup).removeControl(key);
          }
        });
        if (!this.variations.includes(optionName)) {
          this.variations= [optionName];
  
        const variantGroup = this.createVariantGroup();
        (this.addProductForm.get('variants') as FormGroup).addControl(optionName, this.fb.array([variantGroup]));
        } else{
          if (this.product.variants.hasOwnProperty(optionName)) {
            const value = this.product.variants[optionName];
          
            if (Array.isArray(value)) {
              value.forEach((variant: any, index) => {
                let variantFormArray = this.getVariantArray(optionName);
          
                if (!variantFormArray) {
                  // If the FormArray doesn't exist, create it
                  const newFormArray = this.fb.array([]);
                  (this.addProductForm.get('variants') as FormGroup).addControl(optionName, newFormArray);
                  variantFormArray = newFormArray;
                }
          
                const variantGroup = this.fb.group({
                  variant_name: this.fb.nonNullable.control(variant.variant_name),
                  price: this.fb.nonNullable.control(variant.price),
                  in_stock: this.fb.nonNullable.control(variant.in_stock),
                  images: this.fb.nonNullable.array(
                    variant.image.map((img: any) => this.fb.nonNullable.control(img)),
                    this.minLengthArray(1)
                  ),
                });
          
                // Push the variantGroup into the FormArray
                variantFormArray.push(variantGroup);
              });
            }
          }
        }
      } else {
        const index = this.variations.indexOf(optionName);

        if (index === -1) {
          return;
        }

        const alert = await this.alertController.create({
          header: 'Delete ' + optionName + '?',
          message: 'Are you sure you want to delete this variant?',
          buttons: [
            {
              text: 'No, Cancel',
              role: 'cancel',
              handler: () => {
                this.selected[optionName] = !this.selected[optionName];
                const arrayLength =  this.getVariantArray(optionName).length
                if(arrayLength == 0){
                  this.addVariant(optionName)
                }
              }
            },
            {
              text: 'Yes, Delete',
              handler: () => {
                this.variations.splice(index, 1);
                (this.addProductForm.get('variants') as FormGroup).removeControl(optionName);
              },
            },
          ],
        });
      
        await alert.present();
      
      }
      
    }
    // this.addProductForm.addControl('variant_type',  this.fb.nonNullable.control('Color',Validators.required));
  }

  getVariantArrayControls(formGroup: FormGroup, variantType: string): AbstractControl[] {
    const variantArray = formGroup.get(`variants.${variantType}`) as FormArray;
    return variantArray ? variantArray.controls : [];
  }

  segmentChanged(select: any, load:boolean= false, NoVariant:boolean = false) {
    if(this.selectedSegment == select) return;

    this.selectedSegment = select;
    if(load) {
      this.cd.detectChanges();
      return;
    };
    if(this.selectedSegment == 'single'){

      if(!NoVariant &&  (this.addProductForm.get('subvariant_type') != null)){
        // this.productFormSwitcher.single.patchValue(this.productFormSwitcher.single.value)
        this.productFormSwitcher.multiVariant = this.deepCopyFormGroup(this.addProductForm);
      }
      if(Object.keys(this.productFormSwitcher.singleVariant.value).length > 0){
        // this.addProductForm.patchValue(this.productFormSwitcher.singleVariant.value)
    
        this.addProductForm = this.deepCopyFormGroup(this.productFormSwitcher.singleVariant);
      }else{
        
        this.resetVariants();
        this.onVariationsChange('size')
      }
    } else{
      // this.productFormSwitcher.singleVariant.patchValue( this.addProductForm.value);
      if(this.addProductForm.get('subvariant_type') == null && !NoVariant){
        this.productFormSwitcher.singleVariant = this.deepCopyFormGroup(this.addProductForm);
      }
      if(Object.keys(this.productFormSwitcher.multiVariant.value).length > 0){
        // this.addProductForm.patchValue(this.productFormSwitcher.multiVariant.value);
        this.addProductForm = this.deepCopyFormGroup(this.productFormSwitcher.multiVariant)
      }else{
        this.resetVariants();
        this.addSubVariant();
      }
    }
    this.cd.detectChanges()  
  }


  // MULTIPLE VARIATIONSSSSSSSSSSSSS
  addSizePrice(sizeInput: any, priceInput: any) {
    const name = sizeInput.value ? sizeInput.value : '';
    const price = priceInput.value ? parseFloat(priceInput.value) : null;

    if (this.sizePriceEntries.length === 0) {
      const data = this.fb.group({
        name: [name],
        price: [price],
      });
      (this.addProductForm.get('variants') as FormGroup).addControl('type', this.fb.array([data]));

      

      //add the other controls
      const colorData = this.multiFormGroup();
      (this.addProductForm.get('variants') as FormGroup).addControl('colors', this.fb.array([colorData]));

      // patch value for the first array
      const colorsArray = this.getVariantArray('colors');
  
    for (let i = 0; i < colorsArray.length; i++) {
      const typesArray = this.getTypesArray(i);
      // console.log("TYPESARRAY",typesArray)
      if (typesArray.length > 0) {
        const firstType = typesArray.at(0) as FormGroup;
        firstType.patchValue({
          name: name,
          price: price,
        });
      }
    }
    } else {
      const newData = this.fb.group({
        name: [name],
        price: [price],
      });
      ((this.addProductForm.get('variants') as FormGroup).get('type') as FormArray).push(newData);

      // push for colors too
      this.iterateThroughColors(name, price)

    }
    this.sizePriceEntries.push({ name, price, editing: false }); //for editing and counting purposes
    sizeInput.value = '';
    priceInput.value = '';
  }

   addSubVariant() {
    const name = '';
    const price = '';

    this.typesSync.push({
      name:''
    });

    if (this.sizePriceEntries.length === 0) {
      const data = this.fb.group({
        name: [name],
        price: [price],
      });

  
      (this.addProductForm.get('variants') as FormGroup).addControl('type', this.fb.array([data]));

      //add the other controls
      const colorData = this.multiFormGroup();
      (this.addProductForm.get('variants') as FormGroup).addControl('colors', this.fb.array([colorData]));

      // patch value for the first array
      const colorsArray = this.getVariantArray('colors');

      this.addProductForm.addControl('subvariant_type', this.fb.nonNullable.control('Size', Validators.required))
      
  
    for (let i = 0; i < colorsArray.length; i++) {
      const typesArray = this.getTypesArray(i);
      if (typesArray.length > 0) {
        const firstType = typesArray.at(0) as FormGroup;
        firstType.patchValue({
          name: name,
          price: price,
        });
      }
    }
    } else {
      const newData = this.fb.group({
        name: [name],
        price: [price],
      });
      ((this.addProductForm.get('variants') as FormGroup).get('type') as FormArray).push(newData);

      // push for colors too
      this.iterateThroughColors(name, price)

    }
    this.sizePriceEntries.push({ name, price, editing: false }); //for editing and counting purposes
    
  }

  resetVariants(){
    // this.sizePriceEntries = [];
    this.addProductForm.removeControl('variants');
    this.addProductForm.removeControl('variant_type');
    this.addProductForm.removeControl('subvariant_type');
    this.addProductForm.addControl('variant_type',  this.fb.nonNullable.control('Color',Validators.required));
    this.addProductForm.addControl('variants',this.fb.group({}))
  }


  removeSubVariants(){
    // this.sizePriceEntries = [];
    (this.addProductForm.get('variants') as FormGroup).removeControl('type');
    (this.addProductForm.get('variants') as FormGroup).removeControl('colors');
    
  }

  setSizePrice(sizeInput: any, priceInput: any) {
    // const name = sizeInput ? sizeInput : '';
    // const price = priceInput ? parseFloat(priceInput) : null;
    const name ='';
    const price = ''

    if (this.sizePriceEntries.length === 0) {
      const data = this.fb.group({
        name: [name],
        price: [price],
      });
      (this.addProductForm.get('variants') as FormGroup).addControl('type', this.fb.array([data]));

    } else {
      const newData = this.fb.group({
        name: [name],
        price: [price],
      });
      ((this.addProductForm.get('variants') as FormGroup).get('type') as FormArray).push(newData);

      // push for colors too
      // this.iterateThroughColors(name, price)

    }

    this.sizePriceEntries.push({ name, price, editing: false }); //for editing and counting purposes
  }

  deleteSizePrice(index: number) {
    this.sizePriceEntries.splice(index, 1);
    const formArray = this.addProductForm.get('variants.type') as FormArray;
    
    if (index < formArray.length) {
      formArray.removeAt(index);
      this.removeSizePrizeInColors(index)
    }
  }
  

  updateFormValue(event: any, key: string, index: number) {
    const newValue = event.detail.value;
    const keyName = key;
    const entryToUpdate = this.sizePriceEntries[index];
    const formArray = this.addProductForm.get('variants.type') as FormArray;
  
    // for types
    if (entryToUpdate) {
      if (keyName === 'name') {
        entryToUpdate.name = newValue;
        const nameControl = formArray.at(index)?.get('name');
        if (nameControl) {
          nameControl.patchValue(newValue);
        }
      } else if (keyName === 'price') {
        const parsedValue = parseFloat(newValue);
        entryToUpdate.price = isNaN(parsedValue) ? null : parsedValue;
        const priceControl = formArray.at(index)?.get('price');
        if (priceControl) {
          priceControl.patchValue(isNaN(parsedValue) ? null : parsedValue);
        }
      }
    }

    // for colors
    const colorsArray = this.getVariantArray('colors');

    for (let i = 0; i < colorsArray.length; i++) {
      const typesArray = this.getTypesArray(i);

      if (entryToUpdate) {
        if (keyName === 'name') {
          entryToUpdate.name = newValue;
          const nameControl = typesArray.at(index)?.get('name');
          if (nameControl) {
            nameControl.patchValue(newValue);
          }
        } else if (keyName === 'price') {
          const parsedValue = parseFloat(newValue);
          entryToUpdate.price = isNaN(parsedValue) ? null : parsedValue;
          const priceControl = typesArray.at(index)?.get('price');
          if (priceControl) {
            priceControl.patchValue(isNaN(parsedValue) ? null : parsedValue);
          }
        }
      }
    }
  }
  
  

  multiFormGroup(): FormGroup {
    return this.fb.group({
      variant_name: this.fb.control('', Validators.required),
      images: this.fb.array([], this.minLengthArray(1)),
      types: this.fb.array([
        this.fb.group({
          name : this.fb.control('', [Validators.required, Validators.min(1)]),
          in_stock: this.fb.control('', [Validators.required, Validators.min(1)]),
          price: this.fb.control('', [Validators.required, Validators.min(1)]),
        })
      ])
    });
  }

  getTypesArray(variantIndex: number): FormArray {
    const variantsArray = this.getVariantArray('colors')
    const typesArray = variantsArray.at(variantIndex).get('types') as FormArray;
    return typesArray;
  }

  getTypesControls(index:number, i:number){
    const variantArray = this.getTypesArray(i);
    return variantArray.at(index) as FormGroup;
  }

  
  syncKey(event:any,type:any){
    type.name = event.target.value;
  }

  typesSync:any[] = [];

  addTypeVariant(variantType: string) {
    const variantArray = this.getVariantArray(variantType);
    variantArray.push(this.newFormGroup());
    this.itemVariants += 1;
    this.cd.detectChanges();
  }

  iterateThroughColors(name:any, price:any) {
    const colorsArray = this.getVariantArray('colors');
  
    for (let i = 0; i < colorsArray.length; i++) {
      const typesArray = this.getTypesArray(i);
      
      const newData = this.fb.group({
        name: [name, Validators.required],
        price: [price, Validators.required],
        in_stock: ''
      });
      
      typesArray.push(newData);
    }
  }


  removeSizePrizeInColors(index:any) {
    const colorsArray = this.getVariantArray('colors');
  
    for (let i = 0; i < colorsArray.length; i++) {
      const typesArray = this.getTypesArray(i);
      
      typesArray.removeAt(index)
    }
  }

  newFormGroup() {
    const variantsArray = (this.addProductForm.get('variants') as FormGroup).get('type') as FormArray;
    const allValues = variantsArray.controls.map(control => {
      const name = control.get('name')?.value;
      const price = control.get('price')?.value;
      return { name, price };
    });
    let i = 0;
    const typesArray = allValues.map(value => {
      
      const group = this.fb.group({
        name: this.fb.control(this.typesSync[i].name, [Validators.required, Validators.min(1)]),
        in_stock: this.fb.control('', [Validators.required, Validators.min(1)]),
        price: this.fb.control(value.price, [Validators.required, Validators.min(1)]),
      })
      i+=1;
      return group;
    });
  
    return this.fb.group({
      variant_name: this.fb.control('', Validators.required),
      images: this.fb.array([], this.minLengthArray(1)),
      types: this.fb.array(typesArray)
    });
  }

  checkFields(){
    // console.log('Switcher',this.productFormSwitcher);
    // console.log('Current',this.addProductForm);
  }
  
  

}