import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatetimeService {



  offsetObj = this.getOffSet



  constructor() { }


  get getOffSet(){
    const timezoneOffset = new Date().getTimezoneOffset();
    return{
      offsetSign    : timezoneOffset <= 0 ? '+' : '-',   
      offsetHours   : String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0'),
      offsetMinutes : String(Math.abs(timezoneOffset) % 60).padStart(2, '0')     
      
    }
    
  }

  getMinMaxDayFilter(date:Date){
    const year           = date.getFullYear();
    const month          = String(date.getMonth() + 1).padStart(2, '0');
    const day            = String(date.getDate()).padStart(2, '0');

    return {
      min: new Date(`${year}-${month}-${day}T00:00:00${this.offsetObj.offsetSign}${this.offsetObj.offsetHours}:${this.offsetObj.offsetMinutes}`), 
      max: new Date(`${year}-${month}-${day}T23:59:59${this.offsetObj.offsetSign}${this.offsetObj.offsetHours}:${this.offsetObj.offsetMinutes}`)
    }
  }


  getMinMaxMonth(month: number, year: number){
    const lastDay =String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
    const stringMonth = String(month + 1).padStart(2, '0')

    return {
      min : new Date(`${year}-${stringMonth}-01T00:00:00${this.offsetObj.offsetSign}${this.offsetObj.offsetHours}:${this.offsetObj.offsetMinutes}`).getTime(),
      max : new Date(`${year}-${stringMonth}-${lastDay}T23:59:59${this.offsetObj.offsetSign}${this.offsetObj.offsetHours}:${this.offsetObj.offsetMinutes}`).getTime()
    }

  }
  
  

}
