import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})
export class VerificationPage implements OnInit {
  otpCode: string = '';
  phoneNumber: string = '';
  countryCode: string = '';
  isLoading: boolean = false;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    // Get phone details from local storage
    this.phoneNumber = localStorage.getItem('phoneNumber') || '';
    this.countryCode = localStorage.getItem('countryCode') || '';

    if (!this.phoneNumber || !this.countryCode) {
      this.showToast('Phone information missing. Please go back and try again.');
      this.router.navigate(['/sign-in']);
    }
  }

  async tabs() {
    if (!this.otpCode) {
      this.showToast('Please enter the verification code');
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Verifying code...',
        spinner: 'crescent'
      });
      await loading.present();

      // Verify OTP through the API
      const response: any = await this.http.post(`${environment.apiUrl}/api/auth/verify-otp`, {
        phoneNumber: this.phoneNumber,
        countryCode: this.countryCode,
        otp: this.otpCode
      }).toPromise();

      await loading.dismiss();
      this.isLoading = false;

      if (response && response.success) {
        // Save token and user data
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_id', response.data.user.uid);

        // Check if new user to decide navigation
        if (response.data.isNewUser) {
          // Navigate to registration page
          this.router.navigate(['/register']);
        } else {
          // Navigate to home/tabs
          this.navCtrl.navigateRoot(['/tabs']);
        }
      } else {
        this.showToast('Invalid verification code. Please try again.');
      }
    } catch (error) {
      this.isLoading = false;
      const loading = await this.loadingCtrl.getTop();
      if (loading) {
        await loading.dismiss();
      }

      console.error('Error verifying OTP:', error);
      this.showToast('Failed to verify code. Please try again.');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
