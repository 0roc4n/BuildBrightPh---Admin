import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VouchersPageRoutingModule } from './vouchers-routing.module';

import { VouchersPage } from './vouchers.page';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";

@NgModule({
    declarations: [VouchersPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        VouchersPageRoutingModule,
        ToolbarMenuComponent
    ]
})
export class VouchersPageModule {}
