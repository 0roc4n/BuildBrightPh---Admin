import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
    declarations: [ProfilePage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProfilePageRoutingModule,
        ToolbarMenuComponent,
        GoogleMapsModule
    ]
})
export class ProfilePageModule {}
