import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { BehaviorSubject, tap } from 'rxjs';
import { ChartInterface } from 'src/app/interfaces/chart';
import { Status } from 'src/app/interfaces/status';
import { DatetimeService } from 'src/app/services/datetime.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
})
export class AnalysisPage implements OnInit {

  @ViewChild(ChartComponent) chart!:ChartComponent

  xAxisToData = [
    {
      xAxisName: 'Jan',
      data: 0
    },
    {
      xAxisName: 'Feb',
      data: 0
    },
    {
      xAxisName: 'Mar',
      data: 0
    },
    {
      xAxisName: 'Apr',
      data: 0
    },
    {
      xAxisName: 'May',
      data: 0
    },
    {
      xAxisName: 'Jun',
      data: 0
    },
    {
      xAxisName: 'Jul',
      data: 0
    },
    {
      xAxisName: 'Aug',
      data: 0
    },
    {
      xAxisName: 'Sep',
      data: 0
    },
    {
      xAxisName: 'Oct',
      data: 0
    },
    {
      xAxisName: 'Nov',
      data: 0
    },
    {
      xAxisName: 'Dec',
      data: 0
    },
  ]

  currentYear = new Date().getFullYear()

  monthRevenue$ = new BehaviorSubject<any[]>([])

  monthlySalesChart:ChartInterface =
  {
    chart: {
      height: 330,
      type: 'area'
    },
    dataLabels: {
        enabled: false
    },
    colors: ["#FF5C5C"],
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        categories: this.xAxisToData.map(data=>data.xAxisName)
    },
    noData: {
      text: 'Loading...'
    }
  };

  analysisCards=[
    {
      value: 0,
      title: 'Sales Today' ,
      iconSrc: 'assets/icon/Analysis/sales.svg',
      iconCssClass:'sales'
    },
    {
      value: 0,
      title: 'Total Earnings' ,
      iconSrc: 'assets/icon/Analysis/earnings.svg',
      iconCssClass:'earnings'
    },
    {
      value: 0,
      title: 'Pending Orders' ,
      iconName: 'hourglass-sharp',
      iconCssClass:'pending'
    },
    {
      value: 0,
      title: 'Declined Orders' ,
      iconName: 'close-circle-outline',
      iconCssClass:'cancelled'
    },
  ]

  minMaxToday = this.dtService.getMinMaxDayFilter(new Date())
  minMaxMonths = this.setminMaxMonths


  constructor(private orderService : OrdersService,
              private dtService: DatetimeService) { }

  ngOnInit() {

    this.orderService.allOrders$.pipe(
      tap((orders)=>{
        let salesToday    = 0
        let totalEarnings = 0
        let pendingTotal  = 0
        let declinedTotal = 0
        let revenuePerMonth = this.minMaxMonths.map((_)=>0)
        orders.forEach((order: any)=>{
          if(order.status >= Status.Delivered){
            const orderEarning = this.paymentData(order)
            totalEarnings = totalEarnings + orderEarning

            if(order.timestamp >= this.minMaxToday.min && order.timestamp <= this.minMaxToday.max){
              salesToday = salesToday + orderEarning
            }

            this.minMaxMonths.forEach((minMax, index)=>{
              if(order.timestamp >= minMax.min && order.timestamp <= minMax.max ){
                revenuePerMonth[index] = revenuePerMonth[index] + orderEarning
              } 
            })

          }
          else if(order.status === Status.Pending){
            pendingTotal = pendingTotal + 1
          }
          else if(order.status === Status.Declined){
            declinedTotal = declinedTotal + 1
          }
        })

        this.monthRevenue$.next([
          {
            name: "Monthly Revenue", 
            data: revenuePerMonth
          }
        ])

        console.log();
        
        this.analysisCards[0].value = salesToday
        this.analysisCards[1].value = totalEarnings
        this.analysisCards[2].value = pendingTotal
        this.analysisCards[3].value = declinedTotal

      }),
    ).subscribe()
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
        if(discountedPrice < 0) return 0
        else return discountedPrice
      }
      else if(voucherInfo.voucherDiscountType === 'percentage'){
        const discountedPrice = price - ( price * voucherInfo.voucherDiscountValue / 100 )
        return discountedPrice
      }
    }
    else return price
  }

  get setminMaxMonths(){
    const minMaxMonths:any[] = []
    for(let i = 0 ; i<12;i++ ){
      minMaxMonths.push(this.dtService.getMinMaxMonth(i , this.currentYear))
    }
    return minMaxMonths
  }


}

