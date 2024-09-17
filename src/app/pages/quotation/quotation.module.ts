import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuotationPageRoutingModule } from './quotation-routing.module';

import { QuotationPage } from './quotation.page';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";

@NgModule({
    declarations: [QuotationPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        QuotationPageRoutingModule,
        ToolbarMenuComponent
    ]
})
export class QuotationPageModule {}
