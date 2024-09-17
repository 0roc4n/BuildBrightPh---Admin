import { Component, ContentChild } from '@angular/core';
import { IonInput, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-show-hide-password',
  templateUrl: './show-hide-password.component.html',
  styleUrls: ['./show-hide-password.component.scss'],
  standalone:true,
  imports:[IonicModule]
})
export class ShowHidePasswordComponent{
  showPassword!: boolean;
  @ContentChild(IonInput) input!: IonInput;

  constructor() { }
  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }
}
