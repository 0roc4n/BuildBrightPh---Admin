import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartInterface } from 'src/app/interfaces/chart';
import { ChartComponent } from 'ng-apexcharts';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports:[NgApexchartsModule, IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyChartComponent  implements OnInit, OnChanges , AfterViewInit{

  @ViewChild(ChartComponent) chart!:ChartComponent
  @Input() chartOptions!: ChartInterface
  @Input() chartTitle!: String
  @Input() dataInfo?: String
  @Input() withTable?:Boolean


  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("chart", this.chartOptions?.series!);

  }

  ngAfterViewInit(){

    this.chart.updateSeries
    console.log("chart", this.chart.updateSeries);
  }  


  ngOnInit() {}
}
