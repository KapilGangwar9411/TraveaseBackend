import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper'
@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {
  swiper!: Swiper;
  segment: string = "0"
  constructor(private route: Router) { }

  ngOnInit() {
  }

  // TripInfo() {
  //   this.route.navigate(['./trip-info']);
  // }


  onSegmentChange(event: any) {
    const selectedIndex = event.detail.value;
    (<any>document.getElementById("swiper2")).swiper.slideTo(selectedIndex);
  }

  onSlideChange(event: any) {
    this.segment = `${(<any>document.getElementById("swiper2")).swiper.activeIndex}`;
  }

  TripInfo() {
    this.route.navigate(['./ride-accepted']);
  }

  pool_taker_request() {
    this.route.navigate(['./pool-taker-request']);
  }
  list_of_pooler() {
    this.route.navigate(['./list-of-pooler']);
  }
}
