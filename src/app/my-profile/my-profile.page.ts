import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { UserService, UserProfile } from 'src/services/user.service';
import Swiper from 'swiper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit, OnDestroy {
  swiper!: Swiper;
  segment: string = "0";
  isLoading: boolean = false;

  // User profile data
  profile: UserProfile = {};
  private userSubscription: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    // Subscribe to user profile changes
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        console.log('User profile updated in profile page:', user);
        this.profile = user;
      }
    });

    this.loadUserProfile();
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadUserProfile() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.showToast('User ID not found. Please login again.');
      this.logout();
      return;
    }

    try {
      const loading = await this.loadingCtrl.create({
        message: 'Loading profile...',
        spinner: 'crescent'
      });
      await loading.present();

      this.userService.fetchUserProfile(userId).subscribe(
        (userData) => {
          console.log('User profile loaded:', userData);
          this.profile = userData;
          loading.dismiss();
        },
        (error) => {
          console.error('Error loading profile:', error);
          loading.dismiss();
          this.showToast('Failed to load profile. Please try again.');
        }
      );
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.showToast('An unexpected error occurred.');
    }
  }

  async saveProfileInfo() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.showToast('User ID not found. Please login again.');
      this.logout();
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Saving profile information...',
        spinner: 'crescent'
      });
      await loading.present();

      // Extract profile section data
      const profileData = {
        companyName: this.profile.companyName,
        corporateEmail: this.profile.corporateEmail,
        shortBio: this.profile.shortBio,
        hobbies: this.profile.hobbies
      };

      this.userService.updateUserProfile(userId, profileData).subscribe(
        (updatedUser) => {
          console.log('Profile updated:', updatedUser);

          // Update the local profile object with returned data
          this.profile = {...this.profile, ...updatedUser};

          loading.dismiss();
          this.isLoading = false;
          this.showToast('Profile information updated successfully.');
        },
        (error) => {
          console.error('Error updating profile:', error);
          loading.dismiss();
          this.isLoading = false;
          this.showToast('Failed to update profile. Please try again.');
        }
      );
    } catch (error) {
      this.isLoading = false;
      console.error('Error in saveProfileInfo:', error);
      this.showToast('An unexpected error occurred.');
    }
  }

  async saveVehicleInfo() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.showToast('User ID not found. Please login again.');
      this.logout();
      return;
    }

    try {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({
        message: 'Saving vehicle information...',
        spinner: 'crescent'
      });
      await loading.present();

      // Extract vehicle section data
      const vehicleData = {
        vehicleType: this.profile.vehicleType,
        vehicleName: this.profile.vehicleName,
        vehicleRegNumber: this.profile.vehicleRegNumber,
        facilities: this.profile.facilities,
        instructions: this.profile.instructions
      };

      this.userService.updateUserProfile(userId, vehicleData).subscribe(
        (updatedUser) => {
          console.log('Vehicle info updated:', updatedUser);

          // Update the local profile object with returned data
          this.profile = {...this.profile, ...updatedUser};

          loading.dismiss();
          this.isLoading = false;
          this.showToast('Vehicle information updated successfully.');
        },
        (error) => {
          console.error('Error updating vehicle info:', error);
          loading.dismiss();
          this.isLoading = false;
          this.showToast('Failed to update vehicle information. Please try again.');
        }
      );
    } catch (error) {
      this.isLoading = false;
      console.error('Error in saveVehicleInfo:', error);
      this.showToast('An unexpected error occurred.');
    }
  }

  logout() {
    this.userService.logout();
    this.navCtrl.navigateRoot(['./sign-in']);
  }

  onSegmentChange(event: any) {
    const selectedIndex = event.detail.value;
    (<any>document.getElementById("swiper4")).swiper.slideTo(selectedIndex);
  }

  onSlideChange(event: any) {
    this.segment = `${(<any>document.getElementById("swiper4")).swiper.activeIndex}`;
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
