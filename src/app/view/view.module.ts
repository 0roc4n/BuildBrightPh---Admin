import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPageRoutingModule } from './view-routing.module';

import { ViewPage } from './view.page';
import { ScrollbarDirective } from '../directives/scrollbar.directive';
import { MyChartComponent } from "../components/chart/chart.component";

@NgModule({
    declarations: [ViewPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ViewPageRoutingModule,
        ScrollbarDirective,
        MyChartComponent
    ]
})
export class ViewPageModule {}
