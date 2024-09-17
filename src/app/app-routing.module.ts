import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, PreloadAllModules, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { canActivate , redirectUnauthorizedTo, redirectLoggedInTo, emailVerified, AuthPipeGenerator } from '@angular/fire/auth-guard';
import { map, pipe, switchMap } from 'rxjs';

const emailVerification = () => pipe(emailVerified,map((user)=> user ? true : ['login']));

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./view/view.module').then( m => m.ViewPageModule),
    ...canActivate(()=>redirectUnauthorizedTo(['login'])),
    // ...canActivate(()=>emailVerification())

  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    ...canActivate(()=>redirectLoggedInTo([''])),
  },
  {
    path: 'registration',
    loadChildren: () => import('./pages/registration/registration.module').then( m => m.RegistrationPageModule),
    ...canActivate(()=>redirectLoggedInTo([''])),
  },
  {
    path: 'newlogin',
    loadChildren: () => import('./pages/newlogin/newlogin.module').then( m => m.NewloginPageModule)
  },
  {
    path: 'newlogin',
    loadChildren: () => import('./pages/newlogin/newlogin.module').then( m => m.NewloginPageModule)
  },


 



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
