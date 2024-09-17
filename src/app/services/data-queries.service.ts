import { Injectable, inject } from '@angular/core';
import { Database, ListenEvent, Query, QueryConstraint, auditTrail, equalTo, fromRef, list, listVal, objectVal, off, onChildAdded, onValue, orderByChild, push, query, ref, remove, set,stateChanges, update  } from '@angular/fire/database';
import { Observable, ReplaySubject, Subject, bindCallback, combineLatest, distinctUntilChanged, finalize, first, firstValueFrom, forkJoin, iif, map, of, switchMap, tap } from 'rxjs';
import { DataStorageService } from './data-storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import { HelperService } from './helper.service';
import { Status } from '../interfaces/status';
import { AlertController } from '@ionic/angular';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { getDownloadURL } from 'firebase/storage';
@Injectable({
  providedIn: 'root'
})
export class DataQueriesService {

  public vehicleTypes$ = new ReplaySubject<any>(1)



  userRef = ref(this.afDB,'/users')
  ordersRef = ref(this.afDB,'/orders')
  reviewRef = ref(this.afDB,'/reviews')

  constructor(private afDB    : Database,
              private storageService: DataStorageService,
              private helper          : HelperService,
              private alertController: AlertController,
              ) {
                this.getVehicleTypes()
              }

  get categoryRef(){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return ref(this.afDB,`/categories/${storeId}`)
  }

  get productsRef(){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return ref(this.afDB,`/products/${storeId}`)
  }

  async getUserData(email:string){
      const emailQuery:Query = query(this.userRef,orderByChild('/email'),equalTo(email))
      return await firstValueFrom(listVal(emailQuery,{keyField:'id'}))
  }

  getUserById(userId:string){
    return objectVal(ref(this.afDB,`/users/${userId}`))
  }

  getProductById(productId:string):Observable<any>{
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return objectVal(ref(this.afDB,`/products/${storeId}/${productId}`))
  }

  
getVariantIndex(variant_name:string, variants:any):number{

    for(let i = 0; i <  variants.length; i++){
      if(variants[i].variant_name == variant_name ||  variants[i].name == variant_name){
        return i;
      }
    }
  
    return -1;
  }

  orderQueries(){
    const storeId =  JSON.parse(localStorage.getItem('userData')!)?.id
    if(storeId)
    return listVal(query(this.ordersRef,orderByChild('storeId'),equalTo(storeId)),{
      keyField:'id'
    })
    else return of([])
  }

  reviewQueries(){
    const storeId =  JSON.parse(localStorage.getItem('userData')!).id
    const reviewQuery = query(this.reviewRef, orderByChild('/storeId'), equalTo(storeId))
    return listVal(reviewQuery,{
      keyField:'id'
    })
  }

  getCategories(notifierExit:Subject<void>):Observable<any>{
    notifierExit.subscribe(()=>{
      off(this.categoryRef)
    })
    return listVal(this.categoryRef,{
      keyField:'id'
    })
  }

  async createCategory(payload:any, editKey?:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id

    const key = editKey ?? push(ref(this.afDB,`/categories/${storeId}`)).key!
    const imageRef = payload.image[0].binary ? await this.storageService.uploadCategoryImage(key,payload.image[0].binary) : payload.image[0].imageRef
    var icon = null;
    if(payload.icon[0]){
      const iconRef = payload.icon[0].binary ? await this.storageService.uploadCategoryImage(`${key}-icon`,payload.icon[0].binary) : payload.icon[0].imageRef
      icon ={
        imageRef         : iconRef,
        cloudStoragePath : `${key}`,
      }
    }
    await set(ref(this.afDB,`/categories/${storeId}/${key}`),{
      name: payload.name,
      image: {
        imageRef         : imageRef,
        cloudStoragePath : `${key}`,
      },
      icon: icon
    })

    if(payload.subcategories.length){
      const subcatRef =  ref(this.afDB,`/categories/${storeId}/${key}/subcategories`)
      for(let subcategory of payload.subcategories){
        const subKey = subcategory.id ?? push(subcatRef).key!;
        subcategory.id = subKey;
        
      }
      await set(subcatRef, payload.subcategories)
      // console.log(subsObj);
    }
  }

  async deleteTestBulk(){
    // await remove(ref(this.afDB,`/products_test`))
    // const storeId = JSON.parse(localStorage.getItem('userData')!).id
    // await remove(ref(this.afDB,`/products/${storeId}`))
    // await remove(ref(this.afDB,`/categories_test`))
    // await remove(ref(this.afDB,`/orders`))
    // await remove(ref(this.afDB,`/returnProducts`))
    // await remove(ref(this.afDB,`/categories/${storeId}`))
  }

  async iterableCreateCategory(payload:any){
    const defaultImage = {
      cloudStoragePath: "/0",
      imageRef : "https://firebasestorage.googleapis.com/v0/b/errand-mate-ecom.appspot.com/o/products%2F-NViTusbiUhq9kW9h3aB%2F-Nii7lgE3-KWNq8-fLcD%2F0?alt=media&token=67bffe12-00b0-4cca-b1d0-eea9e16fe10b"
    }
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const docRef = await push(ref(this.afDB,`/categories/${storeId}`),{
      name: payload['top-category'],
      image: defaultImage
    })
    return docRef.key;
  }

  similarity(s1:string, s2:string) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toString());
  }

  editDistance(s1:string, s2:string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  async searchReference(files:any,productName:string){
    // search images related to this product

    // const categories = await this.storageService.openDirectory('/bulkImages')
    // var mostSimilar = null;
    // var largestScore = 0;
    // for(let category of categories.prefixes){
    //   if(largestScore < this.similarity(category.name, payload['top-category'])){
    //     mostSimilar =  category;
    //     largestScore = this.similarity(category.name, payload['top-category'])
    //   }
    // }

    // largestScore = 0;
    // const firstLayer = await this.storageService.openDirectory(`/bulkImages/${mostSimilar?.name}`)
    // // look for files
    // if(firstLayer.items.length > 0){
    //   for(let file of firstLayer.items){
    //     const product =  file.name.split('.')[0].replace(' - Copy','');
    //     if(largestScore < this.similarity(product, productName)){
    //       mostSimilar =  file;
    //       largestScore = this.similarity(product, productName)
    //     }
    //   }
    // }
    // // look for folders
    // var isFolder = false;
    // if(firstLayer.prefixes.length > 0){
    //   for(let file of firstLayer.prefixes){
    //     const product =  file.name;
    //     if(largestScore < this.similarity(product, productName)){
    //       mostSimilar =  file;
    //       largestScore = this.similarity(product, productName)
    //       isFolder = true;
    //     }
    //   }
    // }

    // var lastRef = mostSimilar;

    // while(isFolder){
    //   largestScore = 0;
    //   const recursive = await this.storageService.openDirectory(`/bulkImages/${lastRef?.name}`)
    //   // look for files
    //   if(recursive.items.length > 0){
    //     for(let file of recursive.items){
    //       if(largestScore < this.similarity(file.name.split('.')[0].replace(' - Copy',''), productName)){
    //         mostSimilar =  file;
    //         largestScore = this.similarity(file.name.split('.')[0].replace(' - Copy',''), productName)
    //         var isFolder = false;
    //       }
    //     }
    //   }
    //   // look for folders

    //   if(recursive.prefixes.length > 0){
    //     for(let file of recursive.prefixes){

    //       if(largestScore < this.similarity(file.name.split('.')[0].replace(' - Copy',''), payload.name)){
    //         mostSimilar =  file;
    //         largestScore = this.similarity(file.name.split('.')[0].replace(' - Copy',''), payload.name)
    //         isFolder = true;
    //       }
    //     }
    //   }


    //   lastRef = mostSimilar
    // }

    var lastRef = null;
    var largestScore = 0;

    // look for files
    // if(files.items.length > 0){
      for(let file of files.items){
        const product =  file.name.split('.')[0].replace(' - Copy','');
        if(largestScore < this.similarity(product, productName)){
          lastRef =  file;
          largestScore = this.similarity(product, productName)
        }
      }
    // }
    console.log(lastRef?.name, largestScore)
    return lastRef;
  }

  async loadImageRefs(){
    return await this.storageService.openDirectory(`/bulk_images`)
  }

  async iterableCreateProduct(payload:any, files:any){

    const imageRef = await getDownloadURL((await this.searchReference(files, payload.name))!);
    const defaultImage = {
      cloudStoragePath: "/0",
      imageRef : imageRef
    }
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const newProd =  ref(this.afDB,`/products/${storeId}`)

    const pload :any = {
      name        :   (payload.name as string).split('_').join(' '),
      item_code   :   payload.key   ,
      metaKeyword :   (payload.name as string).split('_').join(' ') ,
      category    :   payload.catRef    ,
      description :   payload.description ,
      discount    :   0    ,
      // variant_type: payload.variant_type?? null,
      // subvariant_type: payload.subvariant_type?? null,
    }

    if(payload.variants.length>1 && payload.types.length){
      // multivariant
      
      pload.variant_type = 'Variants';
      pload.subvariant_type = 'Options';
      const color =  await Promise.all(payload.variants.map(async (variant: any): Promise<any> => 
      { 
        const variantRef = await getDownloadURL((await this.searchReference(files, variant))!);
        return {
          image: [{
            cloudStoragePath: "/0",
            imageRef : variantRef
          }],
          types: payload.types.map((type: any) =>({
            name:  (type as string).split('_').join(' '),
            price: 0,
            in_stock:0
          })),
          variant_name:  (variant as string).split('_').join(' '),
        }
      }
    ))
      pload.variants = {
        colors: color,
        type: payload.types.map((type: any) =>({
          name: (type as string).split('_').join(' '),
          price: 0,
          in_stock:0
        })),
      }
    }else if(payload.variants.length>1 && !payload.types.length){
      // single variant 1
      pload.variant_type = 'Variants';
      pload.variants = {
        size:payload.variants.map((variant: any) => 
          ({
            image: [defaultImage],
            variant_name: (variant as string).split('_').join(' '),
            in_stock: 0,
            price: 0,
          })
        ),
      }
    }
    else if(payload.variants.length <= 1 && payload.types.length){
      // single variant 2
      pload.variant_type = 'Variants';
      pload.variants = {
        size:payload.types.map((variant: any) => 
          ({
            image: [defaultImage],
            variant_name:  (variant as string).split('_').join(' '),
            in_stock: 0,
            price: 0,
          })
        ),
      }
    }else{
      // no variant
      pload.price = 0;
      pload.in_stock = 0;
      pload.images = [defaultImage, defaultImage,defaultImage]
    }

    push(newProd,pload)


  }

  async createProduct(payload: any, editId?:string){
    const pload :any = {
      name        :   payload.name        ,
      item_code   :   payload.item_code   ,
      metaKeyword :   payload.metaKeyword ,
      category    :   payload.category    ,
      subcategory :   payload.subcategory?? null ,
      description :   payload.description ,
      discount    :   payload.discount    ,
      variant_type: payload.variant_type?? null,
      subvariant_type: payload.subvariant_type?? null,
    }

    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const newProd = editId  ? ref(this.afDB,`/products/${storeId}/${editId}`) : push(this.productsRef)!
    if(!editId){
      const flag = await this.checkProductNameExist(pload.name)
      console.log("flag",flag);

      if(!flag) {
        const alert = await this.alertController.create({
          header: 'Product name exist.',
          message:'Choose another name or double check your products.',
          buttons: ["OK"]
        })
        alert.present()
        return false
      }
      else{
        if (payload.variants) {

          if (typeof payload.variants === 'object' && payload.variants !== null) {
            const structuredData:any = [];
            console.log('variants',payload.variants);
            for (const key in payload.variants) {
              if(key === 'size' || key === 'color'){
                if (payload.variants.hasOwnProperty(key)) {
                  const value = payload.variants[key];
                  if (Array.isArray(value)) {
                    const keyData:any = [];
                    await Promise.all(value.map(async (variant: any, index: number) => {
                      const imgRefs = await Promise.all(variant.images.map(async (img: any, imgIndex: number) => {
                        
                        if (img.binary) {
                          const filePath = `${key}/${variant.variant_name}/${imgIndex}`;
                          return {
                            imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!, img.binary, filePath),
                            cloudStoragePath: filePath,
                          };
                        } else {
                          return img;
                        }
                      }));

                      const variantData = {
                        image: imgRefs,
                        in_stock: variant.in_stock,
                        price: variant.price,
                        variant_name: variant.variant_name
                      };

                      keyData[index] = variantData;

                    }));

                    structuredData[key] = keyData;
                    
                  } else {
                    console.error(`The value of key "${key}" is not an array.`);
                  }
                  
                }
                pload.variants = structuredData;
                pload.variants = {...pload.variants, 
                  type : payload.variants.colors?.[0]?.types ?? null
                }
              } else {
                if (payload.variants.hasOwnProperty(key)) {
                  const value = payload.variants[key];
                  if (key === 'type' && Array.isArray(value)) {
                      // Handling 'type' case
                      const data = {
                          type: value
                      };
                      pload.variants = data;
  
                  } else if (Array.isArray(value)) {
                      // Handling general case
                      const keyData: any = [];
                      await Promise.all(value.map(async (variant: any, index: number) => {
                          const imgRefs = await Promise.all(variant.images.map(async (img: any, imgIndex: number) => {
                              if (img.binary) {
                                  const filePath = `${key}/${variant.variant_name}/${imgIndex}`;
                                  return {
                                      imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!, img.binary, filePath),
                                      cloudStoragePath: filePath,
                                  };
                              } else {
                                  return img;
                              }
                          }));
              
                          const variantData = {
                              image: imgRefs,
                              variant_name: variant.variant_name,
                              types: variant.types
                          };
              
                          keyData[index] = variantData;
                      }));
              
                      // Merging the structured data with the existing payload.variants
                      pload.variants = { ...pload.variants, ...{ [key]: keyData } };
                 
                     
                  } else {
                      console.error(`The value of key "${key}" is not an array.`);
                  }

                  pload.variants = {...pload.variants, 
                  type : payload.variants.colors?.[0]?.types ?? null
                }
              }
              }
            }
          } else {
            console.error('The "variants" property is not an object.');
          }  
        }
      
        else{
          
          pload.in_stock = payload.in_stock
          pload.price    = payload.price
          pload.images   = await Promise.all(payload.images.map(async (img:any, index: number)=>{
            if(img.binary){
              const filePath = `/${index}`
              return  {
                imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!,img.binary,filePath),
                cloudStoragePath: filePath
              }

            }
            else{
              return img
            }
          }
          ))
        }
  
        await set(newProd,pload)
      }
    }
    else{
      if (payload.variants) {

        if (typeof payload.variants === 'object' && payload.variants !== null) {
          const structuredData:any = [];
          console.log('variants',payload.variants);
          for (const key in payload.variants) {
            if(key === 'size' || key === 'color'){
              if (payload.variants.hasOwnProperty(key)) {
                const value = payload.variants[key];

                if (Array.isArray(value)) {
                  const keyData:any = [];
                  await Promise.all(value.map(async (variant: any, index: number) => {
                    const imgRefs = await Promise.all(variant.images.map(async (img: any, imgIndex: number) => {
                      
                      if (img.binary) {
                        const filePath = `${key}/${variant.variant_name}/${imgIndex}`;
                        return {
                          imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!, img.binary, filePath),
                          cloudStoragePath: filePath,
                        };
                      } else {
                        return img;
                      }
                    }));

                    const variantData = {
                      image: imgRefs,
                      in_stock: variant.in_stock,
                      price: variant.price,
                      variant_name: variant.variant_name
                    };

                    keyData[index] = variantData;

                  }));

                  structuredData[key] = keyData;
                } else {
                  console.error(`The value of key "${key}" is not an array.`);
                }
              }
              pload.variants = structuredData;
              pload.variants = {...pload.variants, 
                type : payload.variants.colors?.[0]?.types ?? null
              }
            } else {
              console.log('variants',payload.variants);
              if (payload.variants.hasOwnProperty(key)) {
                const value = payload.variants[key];
                if (key === 'type' && Array.isArray(value)) {
                    // Handling 'type' case
                    const data = {
                        type: value
                    };
                    pload.variants = data;
                    pload.variants = {...pload.variants, 
                      type : payload.variants.colors?.[0]?.types ?? null
                    }
                    console.log('2023', value);
                } else if (Array.isArray(value)) {
                    // Handling general case
                    const keyData: any = [];
                    await Promise.all(value.map(async (variant: any, index: number) => {
                        const imgRefs = await Promise.all(variant.images.map(async (img: any, imgIndex: number) => {
                            if (img.binary) {
                                const filePath = `${key}/${variant.variant_name}/${imgIndex}`;
                                return {
                                    imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!, img.binary, filePath),
                                    cloudStoragePath: filePath,
                                };
                            } else {
                                return img;
                            }
                        }));
            
                        const variantData = {
                            image: imgRefs,
                            variant_name: variant.variant_name,
                            types: variant.types
                        };
            
                        keyData[index] = variantData;
                    }));
            
                    // Merging the structured data with the existing payload.variants
                    pload.variants = { ...pload.variants, ...{ [key]: keyData } };
                   
                } else {
                    console.error(`The value of key "${key}" is not an array.`);
                }
                pload.variants = {...pload.variants, 
                  type : payload.variants.colors?.[0]?.types ?? null
                }
            }
            }
          }
        } else {
          console.error('The "variants" property is not an object.');
        }  
      }
    
      else{
        
        pload.in_stock = payload.in_stock
        pload.price    = payload.price
        pload.images   = await Promise.all(payload.images.map(async (img:any, index: number)=>{
          if(img.binary){
            const filePath = `/${index}`
            return  {
              imageRef: await this.storageService.uploadProductImages(newProd.key ?? editId!,img.binary,filePath),
              cloudStoragePath: filePath
            }

          }
          else{
            return img
          }
        }
        ))
      }

      await set(newProd,pload)
    }

    return true


  }

  async checkProductNameExist(productName:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const products = await firstValueFrom(listVal(ref(this.afDB,`/products/${storeId}`)))
    const index = products?.findIndex((product:any)=>productName.toLowerCase() == product.name.toLowerCase())
    // console.log("products",products);

    console.log("productName", productName);
    if(typeof(index) === 'number')console.log("index", index, index < 0)


    return typeof(index) === 'number' ? index < 0 : true
  }

  async deleteProduct(product:any ){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await remove(ref(this.afDB,`/products/${storeId}/${product.id}`))
    if(product.variants){
      await Promise.all(product.variants.map(async (variant:any)=>{
        return await Promise.all(variant.images.map((img:any,index:number)=>{
            this.storageService.removeProductFiles(product.id,`${variant.variant_name}/${index}`)
          }))
        })
      )
    }
    else{
      await Promise.all(product.images.map((img:any,index:number)=>{
        this.storageService.removeProductFiles(product.id,`${index}`)
      }))
    }

  }

  async updatePushToken(token:string){
    console.log('TOKEN UPDATED', token);
    const storeId =  JSON.parse(localStorage.getItem('userData')!).id
    set(ref(this.afDB,`/users/${storeId}/pushNotifKey`),token)
  }

  getProducts(notifierExit:Subject<void>):Observable<any>{
    notifierExit.subscribe(()=>{
      off(this.productsRef)
    })
    return listVal(this.productsRef,{
      keyField:'id'
    })
  }

  productCategoryQueries(){
    const storeId =  Object.keys(JSON.parse(localStorage.getItem('userId')!))[0]
    // return this.afDB.list('categories').query.orderByKey().equalTo(storeId).get()
    return
  }

  addNewUser(newData: any){

    // return this.afDB.list('users').push(newData)
    return push(this.userRef,newData)
  }

  getClient(clientId: string){

    // return this.afDB.list('users').query.orderByKey().equalTo(clientId).get()
    return
  }

  getProductDetails(productId: string){
    // return this.afDB.list('products').query.orderByKey().equalTo(productId).get()
    return
  }

  declineOrder(orderId:string,reason: string, clientId:string){
    update(ref(this.afDB,`/orders/${orderId}`),{
      status: Status.Declined,
      declineReason : reason
    })

    // update stocks 

  }

  getUsersByEmail(email:string){
    return listVal(query(ref(this.afDB,`/users`), orderByChild('email'), equalTo(email)))
  }

  async acceptOrder(orderId: string, updates:any[], minVehicleType:any, deliveryFee:any){

    updates.forEach((updateItem)=>{
      update(ref(this.afDB,`/products${updateItem.productReference}`),{
        in_stock: updateItem.in_stock
      })
    })

    const up:any = {
      status: 1.5,
    }
    if(minVehicleType)  up.minVehicleType = minVehicleType
    await update(ref(this.afDB,`/orders/${orderId}`),up)
    if(deliveryFee) {
      update(ref(this.afDB,`/orders/${orderId}/deliveryFeeDetails/calculated`),{
        price: deliveryFee
      })
    }
  }

  doneOrder(orderId:string){
    update(ref(this.afDB,`/orders/${orderId}`),{
      status: 2,
    })
  }

  getOrder(orderId:string){
    return objectVal(ref(this.afDB,`/orders/${orderId}`), 
    {
      keyField:'id'
    }
    )
  }

  getRTlocation(riderId:string){
    return objectVal(ref(this.afDB,`/rtLocation/${riderId}`))
  }


  exitCategoryPage(){
    off(this.categoryRef)

  }

  createUserKey(){
    return push(ref(this.afDB,'/users')).key
  }

  async updateUser(userKey:string, userData:any){
    delete userData.password
    await set(ref(this.afDB,`/users/${userKey}`),userData)
  }

  getUnverifiedUsers(): Observable<any>{
    const unvUserQuery = query(ref(this.afDB,`/users`),orderByChild('verified'), equalTo(false))
    return listVal(unvUserQuery,{
        keyField:'id'
    })
  }

  async verifyUser(userId: string){
    await update(ref(this.afDB,`/users/${userId}`),{
      verified: true
    })
  }

  async addBranch(branchLength: number,branchData:any){
    const userID = JSON.parse(localStorage.getItem('userData')!).id
    await set(ref(this.afDB,`/users/${userID}/branches/${branchLength}`),branchData)
  }

  sendQuotationMessage(orderId:string, chatArray:any[]){
    set(ref(this.afDB,`/orders/${orderId}/quotation/messages`),chatArray)
  }

  async sendQuotationOffer(orderId: string, items:any){
    await Promise.all([
      update(ref(this.afDB,`/orders/${orderId}`),{
        products: items
      }),
      update(ref(this.afDB,`/orders/${orderId}/quotation`),{
        status:Status.Offered
      }),
    ])
  }

  getVehicleTypes(){
    listVal(ref(this.afDB, `vehicleType`)).subscribe((vehicleTypes)=>{
      this.vehicleTypes$.next(vehicleTypes)
    })
  }

  getProductReviews(){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return stateChanges(ref(this.afDB, `reviews/`)).pipe(
      switchMap((change)=>{
        if(change.event === 'child_removed'){
          return of([])
        }
        else{
          return listVal(ref(this.afDB, `reviews/${storeId}`),{
            keyField: 'id'
          }).pipe(
            switchMap((reviews)=>
            combineLatest(reviews!.map((review:any)=> this.getUserById(review.clientId).pipe(
              map((clientDetails:any)=>{
                return {
                  ...review,
                  clientDetails: clientDetails
                }
              })
            )))
            ),
            map((reviews)=>{
              const prodArray:any[] = []
              reviews?.forEach((review:any)=>{
                const found = prodArray.find((prod:any)=> prod.productId === review.productId)
                if(found){
                  found.reviews.push(review)
                }
                else{
                  prodArray.push({
                    productId: review.productId,
                    reviews: [review]
                  })
                }
              })
              return prodArray
            }),
            switchMap((groupedProdReview)=>
              combineLatest(groupedProdReview.map((prod)=> this.getProductById(prod.productId).pipe(
                map((productDetails)=>{
                  return {
                    ...prod,
                    productDetails: productDetails
                  }
                })
              )))
            ),
            tap((see=>{}))
          )
        }
      })
    )
  }

  async deleteReview(reviewData:any,productDetails:any){
    console.log('DET',productDetails)
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await remove(ref(this.afDB,`/reviews/${storeId}/${reviewData.id}`))
    return await firstValueFrom(listVal(query(ref(this.afDB,`/reviews/${storeId}`),orderByChild('productId'),equalTo(reviewData.productId)),{
      keyField: 'id'
    }).pipe(
      switchMap(async (reviews:any)=>{
        if(reviewData.variantIndex === null || reviewData.variantIndex === undefined){
          const totalRating = reviews.reduce((rating:number, review:any)=> review.rating + rating, 0) / reviews.length
          await update(ref(this.afDB,`/products/${storeId}/${reviewData.productId}`),{
            totalRating : isNaN(totalRating) ? 0 : totalRating
          })
          return isNaN(totalRating) ? 0 : totalRating
        }
        else{
         if(productDetails.variants.color){
          const variantRating = reviews.filter((review:any)=> review.variantIndex === reviewData.variantIndex)
          const totalRating = reviews.reduce((rating:number, review:any)=> review.rating + rating, 0) / variantRating.length
          await update(ref(this.afDB,`/products/${storeId}/${reviewData.productId}/variants/color/${reviewData.variantIndex}`),{
            totalRating :isNaN(totalRating) ? 0 : totalRating
          })
          return isNaN(totalRating) ? 0 : totalRating
         }else if(productDetails.variants.colors){
          const variantRating = reviews.filter((review:any)=> review.variantIndex === reviewData.variantIndex)
          const totalRating = reviews.reduce((rating:number, review:any)=> review.rating + rating, 0) / variantRating.length

          // console.log('herer', totalRating)
          await update(ref(this.afDB,`/products/${storeId}/${reviewData.productId}/variants/colors/${reviewData.variantIndex}/types/${reviewData.type}`),{
            totalRating : isNaN(totalRating) ? 0 : totalRating
          })
          return isNaN(totalRating) ? 0 : totalRating
         }
         else if(productDetails.variants.size){
          const variantRating = reviews.filter((review:any)=> review.variantIndex === reviewData.variantIndex)
          const totalRating = reviews.reduce((rating:number, review:any)=> review.rating + rating, 0) / variantRating.length
          await update(ref(this.afDB,`/products/${storeId}/${reviewData.productId}/variants/size/${reviewData.variantIndex}`),{
            totalRating : isNaN(totalRating) ? 0 : totalRating
          })
          return isNaN(totalRating) ? 0 : totalRating
         }else{
          const variantRating = reviews.filter((review:any)=> review.variantIndex === reviewData.variantIndex)
          const totalRating = reviews.reduce((rating:number, review:any)=> review.rating + rating, 0) / variantRating.length
          await update(ref(this.afDB,`/products/${storeId}/${reviewData.productId}/variants/${reviewData.variantIndex}`),{
            totalRating : isNaN(totalRating) ? 0 : totalRating
          })
          return isNaN(totalRating) ? 0 : totalRating
         }
        }
      }),
      tap((value)=>{
        console.log("Value",value);

      })
    ))

  }

  async deleteCategory(categoryId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await remove(ref(this.afDB, `/categories/${storeId}/${categoryId}`))
  }

  getReturnProducts(){
    var storeId = JSON.parse(localStorage.getItem('userData')!).id
    return listVal(ref(this.afDB, `returnProducts/${storeId}`),
      {
        keyField:'id'
      }
    ).pipe(
      switchMap((orders:any)=>{
            if(orders.length){
              return combineLatest(orders.map((order:any)=>
              combineLatest({
                orderDetails: this.getOrder(order.id).pipe(
                                switchMap((orderDetails:any)=>{
                                  if(orderDetails != null){
                                    return  combineLatest({
                                      clientDetails : this.getUserById(orderDetails.clientId)
                                    }).pipe(
                                      map((userDetails)=>{
                                        return  {
                                          ...orderDetails,
                                          clientDetails : userDetails.clientDetails,
                                          storeDetails  : JSON.parse(localStorage.getItem('userData')!),
                                        }
                                      }),
                                    )
                                  }else return of([])
                                }
                                 
                                ),
                              ),
                returnProductDetails: combineLatest(order.products.map((product:any)=>this.getProductById(product.productId).pipe(
                  map((productDetails)=>{
                    product.productDetails = productDetails
                    return product
                  })
                )))
                .pipe(
                  map((prodDetails)=>{
                    order.products = prodDetails
                    return order
                  })
                )
                })
              ))
            }
            else return of([])
          }
        )
      ) as Observable<any>
  }

  getReturnProductById(orderId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return objectVal(ref(this.afDB, `returnProducts/${storeId}/${orderId}`), {
      keyField: 'id'
    }).pipe(
      switchMap((returnProduct:any)=>
      combineLatest(returnProduct.products.map((product:any)=>this.getProductById(product.productId).pipe(
        map((productDetails)=>{
          product.productDetails = productDetails
          return product
        })
      )))
      .pipe(
        map((prodDetails)=>{
          returnProduct.products = prodDetails
          return returnProduct
        })
      )
      )
    )
  }

  chatReturnProduct(orderId:string, messageArray:any[]){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    set(ref(this.afDB, `/returnProducts/${storeId}/${orderId}/chat`),messageArray)
  }

  async resolveReturn(orderId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await update(ref(this.afDB,`/returnProducts/${storeId}/${orderId}`),{
      status:Status.Resolved
    })
    await update(ref(this.afDB,`orders/${orderId}`),{
      returnProductStatus:Status.Resolved,
      status:Status.Resolved,

    })
  }

  async createVoucher(voucherData:any){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await firstValueFrom(
      listVal(query(ref(this.afDB,`/vouchers/${storeId}`), orderByChild('voucherCode'),equalTo(voucherData.voucherCode))).pipe(
        switchMap((vouchers)=>{
          if(vouchers){
            if(vouchers.length > 0){
              throw new Error("exists")
            }
          }
          return push(ref(this.afDB,`/vouchers/${storeId}`),voucherData)
        })
      )
    )
  }

  async editVoucher(voucherData:any,voucherId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    // const voucherId = voucherData.id
    delete voucherData.id
    await set(ref(this.afDB,`/vouchers/${storeId}/${voucherId}`),voucherData)
  }

  getVouchers(){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return listVal(ref(this.afDB,`/vouchers/${storeId}`),{
      keyField:"id"
    }) as Observable<any>
  }

  async deleteVoucher(voucherId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await remove(ref(this.afDB,`/vouchers/${storeId}/${voucherId}`))
  }

  getVoucherData(voucherId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return objectVal(ref(this.afDB,`/vouchers/${storeId}/${voucherId}`))
  }

  async updatePickupImage(order:any, imageRef:string){
    await update(ref(this.afDB,`/orders/${order.id}`),{
      pickupImage: imageRef,
      status: 3,
      pickupDate: new Date().getTime()
    })
    remove(ref(this.afDB,`/users/${order.clientId}/orderId`))
  }

  get pricePerDistance$(){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    return listVal(ref(this.afDB,`/pricePerDistance/${storeId}`),{
      keyField:'id'
    })
  }

  addRate(distance:any, price:any){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    push(ref(this.afDB,`/pricePerDistance/${storeId}`),{
      distance : distance,
      price    :price
    })
  }

  deleteRate(rateId:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    remove(ref(this.afDB,`/pricePerDistance/${storeId}/${rateId}`))
  }

  async updateRate(value:any){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const price = parseInt(value.price)
    await update(ref(this.afDB,`/pricePerDistance/${storeId}/${value.id}`),{
      distance: parseInt(value.distance),
      price: Number.isNaN(price) ? value.price : price
    })
  }

  get riders$(){
    return listVal(query(ref(this.afDB,`/users`), orderByChild('userType'), equalTo('rider')),{
      keyField:'id'
    })
  }

  applyPoints(riderId:string, points:number){
    update(ref(this.afDB,`/users/${riderId}`),{
      points: points
    })
  }

  get getRedeem$(){
    return listVal(query(ref(this.afDB,`/redeemPoints`),orderByChild('status'), equalTo('pending')),{
      keyField: 'id'
    }).pipe(
      switchMap((redeems:any)=>{
        if(redeems?.length > 0){
          return combineLatest(redeems.map((redeem:any)=>{
            return this.getUserById(redeem.riderId).pipe(
              map((riderData)=>{
                return {
                  ...redeem,
                  riderData:riderData
                }
              })
            )
          }))
        }
        else return of([])
      }


      )
    )
  }

  approveRedeem(redeemId:string, riderId:string, calculated:number){
    update(ref(this.afDB,`/redeemPoints/${redeemId}`),{
      status: 'approve',
      approvedAt: new Date().getTime()
    })
    update(ref(this.afDB,`/users/${riderId}`),{
      points: calculated
    })

  }

  declineRedeem(redeemId:string, reason:string){
    update(ref(this.afDB,`/redeemPoints/${redeemId}`),{
      status: 'decline',
      reason: reason,
      declinedAt: new Date().getTime()
    })
  }
}
