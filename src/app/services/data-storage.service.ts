import { Injectable } from '@angular/core';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { listAll } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private afStorage: Storage) {}

  openDirectory(root:string){
    const bulk = ref(this.afStorage,`/${root}`);
    return listAll(bulk)
  }

  async uploadCategoryImage(catId:string,binary:Blob){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const catRef = ref(this.afStorage,`/categories/${storeId}/${catId}`)
    await uploadBytesResumable(catRef, binary)
    return await getDownloadURL(catRef)
  }


  async uploadProductImages(produckKey:string, binary:Blob, varImageIndex:string ){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    const prodRef = ref(this.afStorage,`/products/${storeId}/${produckKey}/${varImageIndex}`)
    console.log("Storage Ref",`/products/${storeId}/${produckKey}/${varImageIndex}` );

    await uploadBytesResumable(prodRef, binary)
    return await getDownloadURL(prodRef)
  }

  async removeProductFiles(produckKey:string,varImageIndex:string){
    const storeId = JSON.parse(localStorage.getItem('userData')!).id
    await deleteObject(ref(this.afStorage,`/products/${storeId}/${produckKey}/${varImageIndex}`))
  }

  async uploadProfilePic(userKey:string, imageBlob: Blob){
    const profileRef = ref(this.afStorage,`/profilePics/${userKey}`);
    await uploadBytesResumable(profileRef,imageBlob)
    return  await getDownloadURL(profileRef)
  }


  async uploadIds(userKey:string, idImageArray: any[]){
    return await Promise.all(idImageArray.map(async(image:any, index: number)=>{
        const blobs = await Promise.all([
          (await(await fetch(image.front)).blob()),
          (await(await fetch(image.back)).blob())
        ])
        const idImgRef = await Promise.all([
          await uploadBytesResumable(ref(this.afStorage,`/ids/${userKey}/${index}/front`),blobs[0]),
          await uploadBytesResumable(ref(this.afStorage,`/ids/${userKey}/${index}/back`),blobs[1]),
        ])
        return {
          front : await getDownloadURL(idImgRef[0].ref),
          back  : await getDownloadURL(idImgRef[1].ref)
        }
    }))
  }

  async uploadPickupImage(orderId:string, imageBinary:any){
    const imageRef = ref(this.afStorage,`/pickupImages/${orderId}`)
    await uploadBytesResumable(imageRef, imageBinary)
    return await getDownloadURL(imageRef)
  }

}
