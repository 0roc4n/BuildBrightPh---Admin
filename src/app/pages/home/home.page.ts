import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';
import { BehaviorSubject, ReplaySubject, Subject, first, pipe, tap } from 'rxjs';
import { ChartInterface } from 'src/app/interfaces/chart';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataQueriesService } from 'src/app/services/data-queries.service';
import { DatetimeService } from 'src/app/services/datetime.service';
import { OrdersService } from 'src/app/services/orders.service';
import { PushNotifService } from 'src/app/services/push-notif.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy , AfterViewInit{

  @ViewChild(ChartComponent) chart!:ChartComponent

  totalsArray = [
              {
                title    : 'Total Order',
                imageSrc : 'assets/icon/Dashboard/online-order-1.png',
                value    :  new BehaviorSubject(0)
              },
              {
                title    : 'Total Delivered',
                imageSrc : 'assets/icon/Dashboard/online-order-2.png',
                value    :  new BehaviorSubject(0)
              },
              {
                title    : 'Total Cancelled',
                imageSrc : 'assets/icon/Dashboard/online-order-3.png',
                value    :  new BehaviorSubject(0)
              },
              {
                title    : 'Total Revenue',
                imageSrc : 'assets/icon/Dashboard/online-order-4.png',
                value    :  new BehaviorSubject(0)
              }

           ]

  numReviews=1

  weekRevenue = 0

  daysOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

  thisWeekInstance = this.getLastSevenDays

  weekRevenueSeries = new BehaviorSubject<ApexAxisChartSeries>([])

  dailyRevenueChart: ChartInterface = {
    // series: [{
    //   name: "Revenue",
    //   data:
    //   }],
    chart: {
      height: 350,
      type: 'area',
      zoom: {
          enabled: false
        },
    },
    colors: ["#4c95dd"],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        categories: this.thisWeekInstance.map((date)=> `${this.daysOfWeekNames[date.getDay()]} (${date.getDate()})`)
    },
    tooltip: {
    y: {
        formatter: (val:any)=> "₱" + val
        },
    },
    noData: {
      text: 'Loading...'
    }
  }




  carouselArray$: ReplaySubject<any[]> =  new ReplaySubject([] as any)

  unsubscribe$ = new Subject<void>()

  constructor(private dataQueries  : DataQueriesService,
              private orderService : OrdersService,
              private dtService    : DatetimeService ) {}




  ngAfterViewInit(): void {
  }



  async ngOnInit() {
    this.orderData()
  }

  ngOnDestroy(): void {
    this.carouselArray$.complete()
    this.totalsArray.forEach((totals)=>totals.value.complete())
    this.unsubscribe$.next()
  }

  async orderData(){
    this.orderService.allOrders$
    .pipe(
      tap((orderData:any)=>{
        const totalOrders  = orderData.filter((p:any) => p.status != 0  )
        const delivered    = orderData.filter((p:any) => p.status >= 3 && p.deliveryMethod !== 'pickup')
        const canceled     = orderData.filter((p:any) => p.status === -1)
        const totalRev     = delivered.reduce((subTotal:number, current:any) => {
          return this.paymentData(current) + subTotal
        },0)
        
        const revenue = this.thisWeekInstance.map(chartData=> 0)

        delivered.forEach((order:any)=>{
          this.thisWeekInstance.forEach((date, index)=>{
            const minMax = this.dtService.getMinMaxDayFilter(date)
            if(order.timestamp >= minMax.min.getTime() && order.timestamp <= minMax.max.getTime()){
              revenue[index] =  revenue[index] + this.paymentData(order)
            }
          })
        })

        this.weekRevenue = revenue.reduce((a,b)=>a+b,0)
        this.weekRevenueSeries.next([
          {
            name: "Revenue",
            data: revenue
          }
        ])


        this.totalsArray[0].value.next(totalOrders.length.toString())
        this.totalsArray[1].value.next(delivered.length.toString())
        this.totalsArray[2].value.next(canceled.length.toString())
        this.totalsArray[3].value.next(totalRev)
      })


    )
    .subscribe((see)=>{
      console.log("see",see);
    })
  }



  paymentData(currentOrder:any){
    const price = currentOrder.products.reduce((prev:number,curr:any)=>{
      // if(curr.variants){
      //   return curr.variants.reduce((varPrev:number,varCurr:any)=>{
      //     return (varCurr.bulk_price ?? (varCurr.price * varCurr.quantity)) + varPrev
      //   },0) + prev
      // }
      // else 
      return (curr.bulk_price ?? (curr.price * curr.quantity)) + prev
    },0)
    if(currentOrder.voucherInfo){
      const voucherInfo = currentOrder.voucherInfo
      if(voucherInfo.voucherDiscountType === 'flat'){
        const discountedPrice = price - voucherInfo.voucherDiscountValue
        if(discountedPrice < 0) return 0 + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
        else return discountedPrice + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
      }
      else if(voucherInfo.voucherDiscountType === 'percentage'){
        const discountedPrice = price - ( price * voucherInfo.voucherDiscountValue / 100 )
        return discountedPrice + (currentOrder.deliveryMethod == 'delivery' ? currentOrder.deliveryFee: 0)
      }
    } 
    else return price 
  }

  get getLastSevenDays() {
    const currentDate = new Date();
    const lastSevenDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      lastSevenDays.push(date);
    }

    return lastSevenDays;
  }




}
