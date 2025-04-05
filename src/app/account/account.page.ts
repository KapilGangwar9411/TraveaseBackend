import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONFIG, AppConfig } from '../app.config';
import { NavController, ModalController } from '@ionic/angular';
import { BuyappalertPage } from '../buyappalert/buyappalert.page';
import { UserService, UserProfile } from 'src/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private route: Router,
    private navCtrl: NavController,
    private modalController: ModalController,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadUserProfile();

    // Subscribe to user profile changes
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      this.userProfile = user;
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserProfile() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.userService.fetchUserProfile(userId).subscribe(
        (user) => {
          console.log('User profile loaded in account page:', user);
        },
        (error) => {
          console.error('Error loading user profile in account page:', error);
        }
      );
    }
  }

  my_profile() {
    this.route.navigate(['./my-profile']);
  }
  wallet() {
    this.route.navigate(['./wallet']);
  }
  my_vehicles() {
    this.route.navigate(['./my-vehicles']);
  }
  manage_address() {
    this.route.navigate(['./manage-address']);
  }
  support() {
    this.route.navigate(['./support']);
  }
  privacy_policy() {
    this.route.navigate(['./privacy-policy']);
  }
  change_language() {
    this.route.navigate(['./language']);
  }
  faqs() {
    this.route.navigate(['./faq']);
  }
  logout() {
    this.userService.logout();
    this.navCtrl.navigateRoot(['./sign-in']);
  }
  developed_by() {
    window.open("https://opuslab.works/", '_system', 'location=no');
  }

  buyappalert() {
    this.modalController.create({ component: BuyappalertPage }).then((modalElement) => modalElement.present());
  }
}
