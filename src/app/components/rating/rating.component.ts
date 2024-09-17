import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  standalone: true,
  imports:[IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingComponent  implements OnChanges {
  @Input() rating! : number;
  @Input() outOf !  : number;
  iconArray!:string[]
  constructor() { }


  ngOnChanges(){
    console.log("init");


    this.iconArray = []

    const remainder = this.rating % 1
    const rating    = this.rating - remainder
    const outOf     = this.outOf - rating

    console.log("Changes PARAMS",remainder ,rating ,outOf );
    for(let r = rating; r >0 ; r--)  this.iconArray.push('star')
    if (remainder)                   this.iconArray.push('star-half')
    for(let o = outOf; o >0 ; --o)   this.iconArray.push('star-outline')
  }


}
