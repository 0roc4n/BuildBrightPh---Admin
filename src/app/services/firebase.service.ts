import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  app         : FirebaseApp    = initializeApp(environment.firebaseConfig)
  auth        : Auth           = getAuth(this.app)

  constructor() { }
}
