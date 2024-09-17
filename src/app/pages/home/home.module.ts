import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { CarouselComponent } from 'src/app/components/carousel/carousel.component';
// import { ChartComponent } from 'src/app/components/chart/chart.component';
import { ScrollbarDirective } from 'src/app/directives/scrollbar.directive';
import { ToolbarMenuComponent } from "../../components/toolbar-menu/toolbar-menu.component";
import { NgApexchartsModule } from 'ng-apexcharts';



@NgModule({
    declarations: [HomePage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        CarouselComponent,
        // ChartComponent,
        ScrollbarDirective,
        ToolbarMenuComponent,
        NgApexchartsModule
    ]
})
export class HomePageModule {}
