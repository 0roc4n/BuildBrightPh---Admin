import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationPageRoutingModule } from './registration-routing.module';

import { RegistrationPage } from './registration.page';
import { ShowHidePasswordComponent } from "../../components/show-hide-password/show-hide-password.component";
import { MapComponent } from "../../components/map/map.component";
import { GoogleMapsModule } from '@angular/google-maps';
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';

@NgModule({
    declarations: [RegistrationPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegistrationPageRoutingModule,
        ReactiveFormsModule,
        ShowHidePasswordComponent,
        MapComponent,
        GoogleMapsModule,
        ScrollbarDirective
    ]
})
export class RegistrationPageModule {}
