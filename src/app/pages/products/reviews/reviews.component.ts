import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { tap } from 'rxjs';
import { ProductReviewModalComponent } from 'src/app/components/product-review-modal/product-review-modal.component';
import { RatingComponent } from "../../../components/rating/rating.component";

@Component({
    selector: 'app-reviews',
    templateUrl: './reviews.component.html',
    styleUrls: ['./reviews.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent, RatingComponent]
})
export class ReviewsComponent  implements OnInit {

  productReviews$ = this.dataQueries.getProductReviews()

  constructor(private dataQueries: DataQueriesService,
              private modalController: ModalController) { }

  ngOnInit() {

    this.productReviews$.subscribe((see)=>{
      console.log("Review",see);      
    })

    // this.dataQueries.testObjVal().subscribe((see)=>{
    //   console.log("TEST",see);
      
    // })
  }

  async productReviewDetails(productReviewDetails:any){
    const modal = await this.modalController.create({
      component: ProductReviewModalComponent,
      componentProps:{
        productReviewDetails: productReviewDetails
      },
      cssClass:'quotationModal'
    })
    modal.present()
  }


}
