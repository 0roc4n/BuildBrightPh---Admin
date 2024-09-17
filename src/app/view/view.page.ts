import { Component, EnvironmentInjector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonMenu } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ChartInterface } from '../interfaces/chart';
import { AuthenticationService } from '../services/authentication.service';
import { OrdersService } from '../services/orders.service';
import { PushNotifService } from '../services/push-notif.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  @ViewChild('mainmenu') menu! :IonMenu

  menuList = [
    {
      title: "Dashboard",
      route: '/home',
      icon: 'storefront'
    },
    {
      title: "Analysis",
      route: '/analysis',
      icon: 'bar-chart'
    },
    {
      title: "Orders",
      icon: 'create',
      subItems: [
        {
          title: "Pending",
          route: '/orders/pending',
          icon: 'hourglass'
        },
        {
          title: "Preparing",
          route: '/orders/preparing',
          icon: 'fast-food'
        },
        {
          title: "Order List",
          route: '/orders/list',
          icon: 'cart'
        },
        {
          title: "For Pickup",
          route: '/orders/pickup',
          icon: 'hand-right-outline'
        },
        {
          title: "Quotation",
          route: '/quotation',
          icon: 'receipt-outline'
        },
        {
          title: "Return Products",
          route: '/orders/return-products',
          icon : 'arrow-undo-outline'
        }
      ]

    },
    {
      title: "Products",
      icon: 'clipboard',
      subItems: [
        {
          title: "Add Product",
          route: '/products/add-product',
          icon: 'duplicate',
        },
        {
          title: "Product List",
          route: '/products/product-list',
          icon: 'albums'
        },
        {
          title: "Categories",
          route: '/products/product-categories',
          icon: 'layers-outline'
        },
        {
          title: "Reviews",
          route: '/products/reviews',
          icon: 'star-outline'
        },
      ]
    },
    {
      title:"Settings",
      icon: 'settings-outline',
      subItems:[
        {
          title: "Distance Rate",
          route: '/settings/distance-rate',
          icon: 'pulse-outline'
        },
        {
          title: "Point Assignment",
          route: '/settings/point-assignment',
          icon: 'apps-outline'
        },
        {
          title: "Redeem Points Requests",
          route: '/settings/redeem-points',
          icon: 'arrow-redo-outline'
        },
        {
          title: "Advertisements",
          route: '/settings/ads',
          icon: 'tv-outline'
        }

      ]
    },
    {
      title: "Vouchers",
      route: '/vouchers',
      icon: 'ticket-outline'
    },
    {
      title: "Verification",
      route: '/verification',
      icon: 'id-card-outline'
    },
    {
      title: "Profile",
      route: '/profile',
      icon: 'person-outline'
    }
  ]

  chartOption:ChartInterface = {
    series: [{
      name: "Sales",
      data: [12, 14, 9, 27, 32, 15, 11]
    }],
    chart: {
      type: 'area',
      height: 60,
      width:100,
      sparkline: {
        enabled: true
      },
    },
    colors: ["#01b075"],
    stroke: {
      curve: 'smooth'
    },
    fill: {
      opacity: 0.3
    },
    yaxis: {
      min: 0
    },
  };




  constructor(public environmentInjector: EnvironmentInjector,
              private router: Router,
              private authService: AuthenticationService,
              private pushNotif: PushNotifService,
              private orderService: OrdersService) { }

  ngOnInit() {
    this.orderService.initialize()
    this.pushNotif.initializePushNotifications()
    // this.pushNotif.addListener()
  }

  get title(){
    return JSON.parse(localStorage.getItem('userData')!).storeName

  }

  gotoRoute(route:string){
    this.router.navigateByUrl(route)
  }

  async closeMenu(){
    if(await this.menu.isActive() && await this.menu.isOpen()){
      this.menu.close()
    }
  }

  signOut(){
    this.orderService.unsubscribe.next()
    localStorage.clear()
    sessionStorage.clear()
    this.authService.signOut()
  }
}
