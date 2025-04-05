import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular'
@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.page.html',
  styleUrls: ['./select-location.page.scss'],
})
export class SelectLocationPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }


  LocationSelected() {
    this.navCtrl.pop();
  }

}
