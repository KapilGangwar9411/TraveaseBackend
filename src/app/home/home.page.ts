import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, } from '@ionic/angular';
import { Router } from '@angular/router';
import { format, parseISO } from 'date-fns'
import Swiper from 'swiper'

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  modes = ['date-time'];
  select_seat: string = "1";
  select_vehicle: string = "1";
  swiper!: Swiper;
  segment: string = "0"
  showPicker = false;
  dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  formattedString = '';
  // @ViewChild('slides', { static: true }) slider: IonSlides;
  @ViewChild(IonDatetime) datetime!: IonDatetime;
  constructor(private route: Router) {
    this.setToday();
  }
  setToday() {
    this.formattedString = format(parseISO(format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z'), 'd MMM, HH:mm');
  }

  ngOnInit() {
  }
  onSegmentChange(event: any) {
    const selectedIndex = event.detail.value;
    (<any>document.getElementById("swiper1")).swiper.slideTo(selectedIndex);
  }

  onSlideChange(event: any) {
    this.segment = `${(<any>document.getElementById("swiper1")).swiper.activeIndex}`;
  }
  select_location() {
    this.route.navigate(['./select-location']);
  }
  listOfPooler() {
    this.route.navigate(['./list-of-pooler']);
  }
  poolTakers() {
    this.route.navigate(['./pool-takers']);
  }
  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedString = format(parseISO(value), 'd MMM, HH:mm');
  }

  close() {
    this.datetime.cancel(true);
  }
  select() {
    this.datetime.confirm(true);
  }
}
