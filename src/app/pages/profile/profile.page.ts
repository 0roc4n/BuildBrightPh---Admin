import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AddBranchComponent } from 'src/app/components/add-branch/add-branch.component';
import { DataQueriesService } from 'src/app/services/data-queries.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit , OnDestroy{

  unsubscribe$= new Subject<void>()

  coordinates?: google.maps.LatLng

  mapOptions:google.maps.MapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
  }

  profile$:Observable<any> = this.dataQueries.getUserById(
    JSON.parse(localStorage.getItem('userData')!).id
  ).pipe(
    takeUntil(this.unsubscribe$)
  )

  constructor(private dataQueries: DataQueriesService,
              private modalController: ModalController) { }
  ngOnDestroy(): void {
    this.unsubscribe$.next()
  }



  ngOnInit() {
    this.profile$.subscribe((see)=>console.log("SEE",see)
    )
    // this.dataQueries.addPriceDistance()

  }


  async addBranch(branchLength: number){
    const modal = await this.modalController.create({
      component: AddBranchComponent,
      componentProps:{
        branchLength: branchLength
      }
    })
    modal.present()
  }





}
