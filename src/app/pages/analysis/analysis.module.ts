import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnalysisPageRoutingModule } from './analysis-routing.module';

import { AnalysisPage } from './analysis.page';
import { MyChartComponent } from "../../components/chart/chart.component";
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
    declarations: [AnalysisPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AnalysisPageRoutingModule,
        MyChartComponent,
        ScrollbarDirective,
        ToolbarMenuComponent,
        NgApexchartsModule
    ]
})
export class AnalysisPageModule {}
