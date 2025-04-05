import { Component, OnInit } from '@angular/core';
import { MyEvent } from 'src/services/myevent.services';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

declare var anime: any;

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  phoneNumber: string = '';
  isLoading: boolean = false;
  defaultCountryCode: string = '91'; // India country code

  constructor(
    private myEvent: MyEvent,
    private route: Router,
    private navCtrl: NavController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // Initialize the sign-in page
    console.log('Sign-in page initialized with default country code: +' + this.defaultCountryCode);
  }

  async continue() {
    if (!this.phoneNumber) {
      this.showToast('Please enter your phone number');
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Sending verification code...',
        spinner: 'crescent'
      });
      await loading.present();

      // Store phone details in local storage for verification page
      localStorage.setItem('phoneNumber', this.phoneNumber);
      localStorage.setItem('countryCode', this.defaultCountryCode);

      // Send OTP via the backend API
      await this.http.post(`${environment.apiUrl}/api/auth/send-otp`, {
        phoneNumber: this.phoneNumber,
        countryCode: this.defaultCountryCode
      }).toPromise();

      await loading.dismiss();
      this.isLoading = false;

      // Navigate to verification page
      this.route.navigate(['./verification']);
    } catch (error) {
      this.isLoading = false;
      const loading = await this.loadingCtrl.getTop();
      if (loading) {
        await loading.dismiss();
      }

      console.error('Error sending OTP:', error);
      this.showToast('Failed to send verification code. Please try again.');
    }
  }

  // For social login flow (Facebook, Google)
  verification() {
    this.route.navigate(['./verification']);
  }

  tabs() {
    this.navCtrl.navigateRoot(['./tabs']);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }

  // ngAfterViewInit(): void {
  //   anime.timeline({ loop: false })
  //     .add({
  //       targets: '.logo .logo_img',
  //       delay: (el, i) => 1000 * i,
  //       scale: [50, 1],
  //       opacity: [0, 1],
  //       duration: 1500,
  //       easing: "easeOutExpo",
  //     })
  // }
}
