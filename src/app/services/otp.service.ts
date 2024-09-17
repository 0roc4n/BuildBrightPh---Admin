import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  
  constructor(private http: HttpClient,
              private loadingController: LoadingController,
              private alertController: AlertController,
              ) { }

  async sendOTP(mobile_no:any){
    const otpSendLoading = await this.loadingController.create({
      message: 'Sending OTP'
    })
    otpSendLoading.present()
    try{

      const pinData = await firstValueFrom(this.http.post<any>(environment.otpAPI.sendPinRequest.url,
          {
            ...environment.otpAPI.sendPinRequest.credentials,
            msisdn: mobile_no
          },
        )
      )

      otpSendLoading.dismiss()

      return pinData
    }
    catch(err){

      otpSendLoading.dismiss()      

      const errorAlert = await this.alertController.create({
        header:'Something went wrong...',
        message:'Please contact us.',
        buttons:["OK"]
      })
      
      errorAlert.present()
      return 'error'
    }
 
  }


  async verificationAlert(){
    const pinAlert = await this.alertController.create({
      header:'Enter Pin',
      inputs:[{
        placeholder: 'OTP PIN...',
        min:6,
        max:6,
        type: 'tel'
      }],
      backdropDismiss:false,
      buttons:[
        "Cancel",
        {
          text: 'Resend Pin',
          role: 'resend'
        },
        {
          text:"Ok",
          role:"ok"
        }
      ]
    })

    pinAlert.present()
    return await pinAlert.onWillDismiss()
  }

  async verifyOTP(pinData:any, pin:string){

    // return CapacitorHttp.post({
    //   url: environment.otpAPI.verifyPinRequest.url,
    //   data:{
    //     ...environment.otpAPI.verifyPinRequest.credentials,
    //     ref_code : pinData.ref_code,
    //     pin      : pin
    //   }
    // })

    return firstValueFrom(
      this.http.post(environment.otpAPI.verifyPinRequest.url,{
          ...environment.otpAPI.verifyPinRequest.credentials,
          ref_code : pinData.ref_code,
          pin      : pin
        }
      )
    )
  }

  async otpExpired(){
    const alert = await this.alertController.create({
      header  : 'PIN expired.',
      message : 'You can send pin again.',
      buttons : [
        "Cancel",
        {
          text:'Ok',
          role:'ok'
        }
      ]  
    })
    alert.present()
    return await alert.onWillDismiss()
  }

  async invalidPIN(){
    const alert = await this.alertController.create({
      header  : 'Invalid PIN.',
      message : 'Cheack and input your pin again.',
      inputs:[{
        placeholder: 'OTP PIN...',
        min:7,
        max:7,
        type: 'tel'
      }],
      buttons : [
        "Cancel",
        {
          text: "Resend PIN",
          role: 'resend'
        },
        {
          text:'Ok',
          role:'ok' 
        }
      ]  
    })
    alert.present()
    return alert.onWillDismiss()
  }

}
