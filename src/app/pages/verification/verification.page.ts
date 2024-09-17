import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserVerificationActionComponent } from 'src/app/components/user-verification-action/user-verification-action.component';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {

  unverifiedUsers$ = this.dataQueries.getUnverifiedUsers()

  constructor(private dataQueries: DataQueriesService,
              private modalController: ModalController) { }

  ngOnInit() {
    this.dataQueries.getUnverifiedUsers().subscribe(
      (see:any)=>console.log("SEE",see)
    )
    
  }

  async details(userData:any){
    const modal = await this.modalController.create({
      component: UserVerificationActionComponent,
      componentProps: {
        userData: userData
      }
    })

    modal.present()

  }

  verifyUser(userid:string, event:any){
    event.stopPropagation()
    this.dataQueries.verifyUser(userid)
  }

  goToLink(url: string, event:any){
    console.log("event",event);
    event.stopPropagation()
    window.open(url, "_blank");
}

}
