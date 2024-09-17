import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-toolbar-menu',
  templateUrl: './toolbar-menu.component.html',
  styleUrls: ['./toolbar-menu.component.scss'],
  standalone: true,
  imports:[IonicModule]
})
export class ToolbarMenuComponent  implements OnInit {

  @Input() title!:String

  constructor() { }

  ngOnInit() {}

}
