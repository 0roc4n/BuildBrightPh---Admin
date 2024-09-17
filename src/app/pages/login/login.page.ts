import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil, tap } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit,AfterViewInit,OnDestroy{

  loginForm: FormGroup = this.fb.group({
    email: null,
    password: null,
  })

  disable$ = new BehaviorSubject<boolean>(true)

  unsubsctibe$ = new Subject<void>()


  passwordInput = {
    type: "password",
    icon: "eye-outline"
  }

  constructor(private fb          : FormBuilder,
              private authService : AuthenticationService,
              private orderService: OrdersService,
              private router      : Router) {
              }


  ngOnInit() {
  }


  ngAfterViewInit(){
    this.loginForm.get('email')!.setValidators( [Validators.required,Validators.email])
    this.loginForm.get('password')!.setValidators([Validators.required, Validators.minLength(6)])

    this.loginForm.statusChanges.pipe(
      takeUntil(this.unsubsctibe$),
      tap((change)=>{
       this.disable$.next(change !== 'VALID')
     })).subscribe()
  }

  ngOnDestroy(){
  this.unsubsctibe$.next()
  }

  async signIn(){
    await this.authService.signIn(this.loginForm.value.email,this.loginForm.value.password)
  }


  gotoRegistration(){
    this.router.navigate(['registration'])
  }

  clickPasswordType(){
    if(this.passwordInput.type === 'password'){
      this.passwordInput = {
        type : 'text',
        icon : 'eye-off-outline'
      }
    }
    else{
      this.passwordInput = {
        type: "password",
        icon: "eye-outline"
      }
    }
  }

  resetPassword(){
    this.authService.resetPassword()
  }


}
