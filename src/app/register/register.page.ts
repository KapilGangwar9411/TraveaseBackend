import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  fullName: string = '';
  email: string = '';
  phoneNumber: string = '';
  countryCode: string = '';
  userId: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Get user ID and phone from local storage
    this.userId = localStorage.getItem('user_id') || '';
    this.phoneNumber = localStorage.getItem('phoneNumber') || '';
    this.countryCode = localStorage.getItem('countryCode') || '';

    if (!this.userId) {
      this.showToast('User information missing. Please sign in again.');
      this.router.navigate(['/sign-in']);
    }

    console.log('Register page loaded with data:', {
      userId: this.userId,
      phoneNumber: this.phoneNumber,
      countryCode: this.countryCode
    });
  }

  async verification() {
    if (!this.userId) {
      this.showToast('User ID is missing. Please sign in again.');
      this.router.navigate(['/sign-in']);
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Updating profile...',
        spinner: 'crescent'
      });
      await loading.present();

      // Register user with the provided details
      const registerData = {
        uid: this.userId,
        fullName: this.fullName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        countryCode: this.countryCode
      };

      console.log('Sending registration data:', registerData);

      await this.http.post(`${environment.apiUrl}/api/auth/register`, registerData).toPromise();

      await loading.dismiss();
      this.isLoading = false;

      // Navigate to tabs/home
      this.navCtrl.navigateRoot(['/tabs']);
    } catch (error) {
      this.isLoading = false;
      const loading = await this.loadingCtrl.getTop();
      if (loading) {
        await loading.dismiss();
      }

      console.error('Error registering user:', error);
      this.showToast('Failed to update profile. Please try again.');
    }
  }

  async skipRegistration() {
    if (!this.userId) {
      this.showToast('User ID is missing. Please sign in again.');
      this.router.navigate(['/sign-in']);
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Continuing...',
        spinner: 'crescent'
      });
      await loading.present();

      // Skip registration
      await this.http.post(`${environment.apiUrl}/api/auth/skip-register`, {
        uid: this.userId
      }).toPromise();

      await loading.dismiss();
      this.isLoading = false;

      // Navigate to tabs/home
      this.navCtrl.navigateRoot(['/tabs']);
    } catch (error) {
      this.isLoading = false;
      const loading = await this.loadingCtrl.getTop();
      if (loading) {
        await loading.dismiss();
      }

      console.error('Error skipping registration:', error);
      this.showToast('Failed to continue. Please try again.');
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
