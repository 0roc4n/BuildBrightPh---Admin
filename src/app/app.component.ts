import { Component,  OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
// import { FirebaseService } from './services/firebase.service';
import { PushNotifService } from './services/push-notif.service';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {



  constructor(
              private auth: Auth,
              private pushNotif : PushNotifService) {
  }


  async ngOnInit() {

    let userDataStorage:any|null = localStorage.getItem('userData')
    if(userDataStorage) userDataStorage = JSON.parse(userDataStorage)


    const user = await firstValueFrom(authState(this.auth))
    if(user){
      console.log("deep",userDataStorage.userType);
      if(userDataStorage.userType === 'store'){
        console.log("deep",userDataStorage.userType);
        if(user.emailVerified){
          this.pushNotif.initializePushNotifications()
          this.pushNotif.addListener()
        }
        else{
          await this.auth.signOut()
          localStorage.clear()
          sessionStorage.clear()

        }
      }
      else{
        await this.auth.signOut()
        localStorage.clear()
        sessionStorage.clear()

      }

    }
 }



}
