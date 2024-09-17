import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, Subscription, of, takeUntil, tap } from 'rxjs';
import { DataQueriesService } from './data-queries.service';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  unsubscribe = new Subject<void>()

  allOrders$ = new ReplaySubject<any>(1)


  constructor(private dataQueries: DataQueriesService,
              private helper: HelperService) {
              }

  initialize(){
    this.dataQueries.orderQueries().pipe(
      tap((orders)=>{
        // console.log('ORDERS',orders);
        this.allOrders$.next(orders)
      })
    ).subscribe()
  }



}

