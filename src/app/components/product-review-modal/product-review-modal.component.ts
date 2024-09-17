import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { RatingComponent } from "../rating/rating.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
    selector: 'app-product-review-modal',
    templateUrl: './product-review-modal.component.html',
    styleUrls: ['./product-review-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, RatingComponent]
})
export class ProductReviewModalComponent  implements OnInit {

  productReviewDetails!:any


  constructor(private modalController   : ModalController,
              private loadingController : LoadingController,
              private alertController: AlertController,
              private dataQueries: DataQueriesService) { }

  ngOnInit() {
    console.log("productReviewDetails",this.productReviewDetails);
  }

  dismissModal(){
    this.modalController.dismiss()
  }

  filterVariantReviews(item:any){
    // return this.productReviewDetails.reviews.filter((review:any)=>review.variantIndex === index)
    return this.productReviewDetails.reviews.filter((review:any)=>this.matchVariant(item.variants,review.variants))
  }

  matchVariant( itemVariants:any, productVariants:any ){
    let matching = 0;
    itemVariants.forEach((variant:any)=>{
      productVariants.forEach((prodVariant:any)=>{
        if(variant.variant == prodVariant.variant){
          matching +=1;
        }
      })
     
    })
    return (matching >= productVariants.length);
  }

  async deleteReview(reviewData:any){
    const alert = await this.alertController.create({
      header: "Are you sure?",
      message: "This review will be deleted",
      buttons:["Cancel", {
        text: "OK",
        role: 'ok'
      }]
    })
    alert.present()
    const flag = await alert.onWillDismiss()
    console.log('flag',flag.role) 
    if(flag.role === 'ok'){

      const loading = await this.loadingController.create({
        message: 'Deleting review...'
     })

     loading.present()
     
    //  try{
      const averageRating = await this.dataQueries.deleteReview(reviewData, this.productReviewDetails.productDetails)
      loading.dismiss()
      
      this.productReviewDetails.reviews = this.productReviewDetails.reviews.filter((review:any)=>review.id !== reviewData.id)

      if(reviewData.variantIndex === undefined){
        if(averageRating === 0 ) this.modalController.dismiss()
        else this.productReviewDetails.productDetails.totalRating = averageRating
      }
      else{
        if(this.productReviewDetails.productDetails.variants.colors){
          this.productReviewDetails.productDetails.variants.colors[reviewData.variantIndex].types[reviewData.type].totalRating = averageRating
          const productRating = this.productReviewDetails.productDetails.variants.colors[reviewData.variantIndex].types.reduce((rating:number, variant:any)=> variant.hasOwnProperty('totalRating') ? variant.totalRating +  rating : rating ,0 )
          if(productRating === 0 ) this.modalController.dismiss()
        }else if(this.productReviewDetails.productDetails.variants.color){
          this.productReviewDetails.productDetails.variants.color[reviewData.variantIndex].totalRating = averageRating
          const productRating = this.productReviewDetails.productDetails.variants.color.reduce((rating:number, variant:any)=> variant.hasOwnProperty('totalRating') ? variant.totalRating +  rating : rating ,0 )
          if(productRating === 0 ) this.modalController.dismiss()
        }else if(this.productReviewDetails.productDetails.variants.size){
          this.productReviewDetails.productDetails.variants.size[reviewData.variantIndex].totalRating = averageRating
          const productRating = this.productReviewDetails.productDetails.variants.size.reduce((rating:number, variant:any)=> variant.hasOwnProperty('totalRating') ? variant.totalRating +  rating : rating ,0 )
          if(productRating === 0 ) this.modalController.dismiss()
        }else {
          this.productReviewDetails.productDetails.variants[reviewData.variantIndex].totalRating = averageRating
          const productRating = this.productReviewDetails.productDetails.variants.reduce((rating:number, variant:any)=> variant.hasOwnProperty('totalRating') ? variant.totalRating +  rating : rating ,0 )
          if(productRating === 0 ) this.modalController.dismiss()
        }

      }
      

      console.log("AVERAGE", averageRating);
      
    //  }
    // catch(err){
    //   loading.dismiss()
    //   console.log("err",err);
      
    // }     



    }
 
  } 

}
