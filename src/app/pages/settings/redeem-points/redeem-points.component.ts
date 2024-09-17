import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-redeem-points',
    templateUrl: './redeem-points.component.html',
    styleUrls: ['./redeem-points.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent]
})
export class RedeemPointsComponent  implements OnInit {

  redeem$:Observable<any> = this.dataQueries.getRedeem$

  constructor(private dataQueries: DataQueriesService,
              private alertController: AlertController) { }

  ngOnInit() {
    this.redeem$.subscribe((see)=>{
      console.log("SEE",see);
    })
  }

  approve(redeemId:string, riderId:string, calculated:number){
    this.dataQueries.approveRedeem(redeemId,riderId,calculated)
  }

  async decline(redeemId:string){
    const alert = await this.alertController.create({
      header: "Input Reason",
      inputs:[{
        placeholder:'reason',
        type: 'textarea',
        name:'reason'
      }],
      buttons:["Cancel",{
        text: "Ok",
        role: 'ok'
      }]
    })

    alert.present()
    const flag = await alert.onWillDismiss()
    if(flag.role ==='ok'){
      console.log("value",flag.data.values.reason);
      if(flag.data.values.reason === ''){
        const invalAlert = await this.alertController.create({
          header:'Reason Empty.',
          message: 'Please input the reason why you are declining.',
          buttons:["Ok"]
        })
        invalAlert.present()
        await invalAlert.onWillDismiss()
        this.decline(redeemId)
      }
      else{
        this.dataQueries.declineRedeem(redeemId,flag.data.values.reason)
      }

    }
  }

}
