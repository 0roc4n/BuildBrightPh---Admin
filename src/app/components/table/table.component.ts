import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TableInterface } from 'src/app/interfaces/table';
import { Ng2SearchPipe } from 'src/app/pipes/filter.pipe';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports:[CommonModule, IonicModule,Ng2SearchPipe]
})
export class TableComponent  implements OnInit {

  @Input() headerArray!: any[]
  @Input() dataForm!: any[]
  @Input() withSearch!: Boolean
  filter:any

  constructor() { }

  ngOnInit() {}

  onSearchChange(event:any){
    this.filter=event.detail.value
    console.log("event",event);
  }
}
