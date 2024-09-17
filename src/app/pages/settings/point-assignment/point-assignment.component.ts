import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { ToolbarMenuComponent } from "../../../components/toolbar-menu/toolbar-menu.component";
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-point-assignment',
    templateUrl: './point-assignment.component.html',
    styleUrls: ['./point-assignment.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ToolbarMenuComponent]
})
export class PointAssignmentComponent  implements OnInit {

  riders$:Observable<any> = this.dataQueries.riders$

  constructor(private dataQueries: DataQueriesService,
              private alertController: AlertController) { }

  ngOnInit() {
    this.riders$.subscribe((
      see=>{
        console.log("See",see);
        
      }
    ))
  }


  async pointsOperation(riderData:any,operation:boolean){

    console.log("riderData",riderData);
    
    const verb  = operation ? 'Add' : 'Deduct' 
    const alert = await this.alertController.create({
      header: `${verb} Points to ${riderData.fullname.first} ${riderData.fullname.middleInitial}. ${riderData.fullname.last}`,
      inputs:[{
        placeholder: `Points to ${verb}...`,
        name: 'points',
        type: 'number',
      }],
      buttons:["Cancel",{
        text: "Confirm",
        role: 'ok'
      }]
    })
    alert.present()
    const flag = await alert.onWillDismiss()

    if(flag.role === 'ok'){
      if(!flag.data.values.points){
        await this.invalidAlert()
        this.pointsOperation(riderData,operation)
      }
      else{
        const currentPoints = riderData.points ?? 0
        if(operation){
          this.dataQueries.applyPoints(riderData.id,  currentPoints + parseFloat(flag.data.values.points))
        }
        else{
          this.dataQueries.applyPoints(riderData.id,  currentPoints - parseFloat(flag.data.values.points))
        }
      }
    }

   
    
  }

  async invalidAlert(){
    const alert = await this.alertController.create({
      header : 'Invalid input.',
      message: 'Please try again later.',
      buttons: ['Ok']
    })
    alert.present()
    await alert.onWillDismiss()
  }

}
