import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import SwiperCore, { Keyboard, Mousewheel,  SwiperOptions, Zoom } from 'swiper';
// import { RatingComponent } from '../rating/rating.component';
import { IonicModule } from '@ionic/angular';
import { RatingComponent } from '../rating/rating.component';

// SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports:[SwiperModule, CommonModule, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent  implements OnInit, OnChanges {
  @Input() carouselArray!:Array<any> |null

  readonly swipeOpt: SwiperOptions = {
    modules:[Keyboard, Mousewheel],
    loop: true,
    breakpoints: {
      1000:{
        slidesPerView: 2,
        spaceBetween: 0,
      },
      1300: {
        slidesPerView: 3,
        spaceBetween: 0,
      },
      1700: {
        slidesPerView: 4,
        spaceBetween: 0,
      },
    }
  }


  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.carouselArray?.forEach(
      (see, index)=>console.log("SEEEEEEE")
    )

  }



  ngOnInit() {}

  type(som: any){
    return typeof(som)
  }

}
