import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

// Import kedua versi ikon: outline untuk default, dan filled untuk aktif
import { 
    homeOutline, home, 
    peopleOutline, people, 
    readerOutline, reader, 
    fastFoodOutline, fastFood, 
    analyticsOutline, analytics 
} from 'ionicons/icons';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.page.html',
    standalone: true,
    imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
    constructor() {
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
            'analytics': analytics 
        });
    }
}