import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { DataQueriesService } from './data-queries.service';
import { Platform, ToastController } from '@ionic/angular';
import { Messaging, getMessaging, getToken, onMessage } from '@angular/fire/messaging';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotifService {
  messagingInstance =  getMessaging(this.afMessaging.app)

  constructor(private dataQueries: DataQueriesService,
              private platform: Platform,
              private http : HttpClient,
              private afMessaging: Messaging,
              private toastController: ToastController
              ) { }
              // async initializePushNotifications(){
              //   if(this.platform.is('hybrid')){
              //     PushNotifications.checkPermissions()
              //     const permStatus = await PushNotifications.requestPermissions()
              //     if(permStatus.receive === 'granted'){
              //       PushNotifications.register();
              //     }
              //   }
              //   else{
              //     console.info("Push Notification for Web is not yet implemented");
              //   }
              // }
            
              // addListener(){
              //   if(this.platform.is('hybrid')){
              //     PushNotifications.addListener('registration',
              //     (token: Token) => {
              //       localStorage.setItem('pushNotifKey',token.value)
              //         this.updatePushToken(token)
              //       }
              //     );
              //   }
              //   else{
              //     console.info("Push Notification for Web is not yet implemented");
              //   }
              // }
            
            


  async initializePushNotifications(){
    if(this.platform.is('hybrid')){

      PushNotifications.checkPermissions()
      const permStatus = await PushNotifications.requestPermissions()
      console.log("Permission Status", permStatus.receive);

      if(permStatus.receive === 'granted'){
        PushNotifications.register();
      }
    }
    else{
      this.webPushPermission()
      console.info("Push Notification for Web is not yet implemented");
    }

  }

  addListener(){
    if(this.platform.is('hybrid')){
        PushNotifications.addListener('registration',
        (token: Token) => {
          localStorage.setItem('pushNotifKey',token.value)
            this.updatePushToken(token)
          }
        );
    }
    else{
      console.info("Push Notification for Web is not yet implemented");
    }
  }

  async webPushPermission(){
    const permission = await Notification.requestPermission()
    if(permission === 'granted'){
      const token = await getToken(this.messagingInstance,{
        vapidKey: environment.webPushCert
      })
      this.dataQueries.updatePushToken(token)
      this.webPushListener()
    }
    // this.afMessaging

    // this.afMessaging.requestPermission.subscribe((permission)=>{
    //   if(permission == 'granted'){
    //     this.webPushToken()

    //   }
    // })
  }

  async webPushToken(){

    // this.afMessaging.requestToken.subscribe( async (token)=>{
    //   console.log("TOKEN", token);
    //   const userId =   Object.keys(JSON.parse(localStorage.getItem('userId')!))[0]
    //    await this.dataQueries.userRef
    //   //  .set(`/${userId}/pushNotifKey`, token)
    //   //  this.webPushListener()
    //   }
    // )

  }

  webPushListener(){
    console.log("LISTENING");
    onMessage(this.messagingInstance,async(message)=>{
      const toast = await this.toastController.create({
        header:message.notification?.title,
        message:  message.notification?.body,
        duration: 1500,
        position: 'top'
      });
      toast.present()
    })
    // this.afMessaging.messages.subscribe(async (message)=>{
    //   console.log("message",message);
    //   const toast = await this.toastController.create({
    //     header:message.notification?.title,
    //     message:  message.notification?.body,
    //     duration: 1500,
    //     position: 'top'
    //   });
    //   toast.present()
    // })
  }



  updatePushToken(pushNotifKey:Token){
    const userId =   Object.keys(JSON.parse(localStorage.getItem('userId')!))[0]
    // this.dataQueries.userRef.set(`/${userId}/pushNotifKey`, pushNotifKey.value)
  }


  sendMessage(pushNotifToken: string, message:string){
    this.http.post(environment.sendPushEndPoint,{
      to: pushNotifToken,
        notification: {
              sound: "default",
              title:`Order is Ready!`,
              body: message,
              content_available: true,
              priority:"high"
          },
          data:{
            sound: "default",
            title:"Order is Ready!",
            body: `Order is now ready!`,
            content_available: true,
            priority:"high"
          }
    },{
      headers:{
        'Authorization' : `key=${environment.serverKey}`,
        'Content-Type'  : 'application/json',
      }
    }).subscribe((see)=>{
      console.log("SEE",see);
    })

  }



}
