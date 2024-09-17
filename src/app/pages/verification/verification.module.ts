import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificationPageRoutingModule } from './verification-routing.module';

import { VerificationPage } from './verification.page';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";

@NgModule({
    declarations: [VerificationPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        VerificationPageRoutingModule,
        ToolbarMenuComponent
    ]
})
export class VerificationPageModule {}
