import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  objToArrWithId(obj:Object){
    return obj
              ? Object.entries(obj).map((item)=> {
                  item[1].id = item[0]
                  return item[1]
                })
              : []
  }

  objToArr(obj:Object){
    // console.log("Helper Obj",obj);
    // console.log("Helper Val", Object.values(obj))
    return obj ? Object.values(obj).filter((a)=>a) : []
  }
}
