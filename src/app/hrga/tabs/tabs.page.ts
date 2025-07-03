import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { AuthService } from '../../services/auth.service';

// Import ikon
import { 
    homeOutline, home, 
    peopleOutline, people, 
    readerOutline, reader, 
    fastFoodOutline, fastFood, 
    analyticsOutline, analytics,
    logOutOutline, logOut
} from 'ionicons/icons';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.page.html',
    standalone: true,
    imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
    constructor(private authService: AuthService) {
        // Daftarkan semua ikon yang akan digunakan di tab bar
        addIcons({ 
            // Dashboard
            'home-outline': homeOutline, 
            'home': home, 

            // Employees
            'people-outline': peopleOutline, 
            'people': people, 

            // Orders
            'reader-outline': readerOutline, 
            'reader': reader, 
            
            // Konsumsi
            'fast-food-outline': fastFoodOutline, 
            'fast-food': fastFood, 
            
            // Report
            'analytics-outline': analyticsOutline, 
            'analytics': analytics,
            
            // Logout
            'log-out-outline': logOutOutline,
            'log-out': logOut
        });
    }

    async logout() {
        await this.authService.logout();
    }
}