import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroBanner } from './components/hero-banner/hero-banner';
import { GiftsSection } from './gifts-section/gifts-section';
import { EventBannerComponent } from './components/event-banner/event-banner';
import { EventDetailsComponent } from './components/event-details/event-details';
import { GiftSectionComponent } from './components/gift-section/gift-section';
import { FoodRestrictionsFormComponent } from './components/food-restrictions-form/food-restrictions-form';
import { SongSuggestionsComponent } from './components/song-suggestions/song-suggestions';
import { InstagramHashtagComponent } from './components/instagram-hashtag/instagram-hashtag';
import { RsvpComponent } from './components/rsvp/rsvp';
import { FooterNamesComponent } from './components/footer-names/footer-names';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeroBanner,
    GiftsSection,
    EventBannerComponent,
    EventDetailsComponent,
    GiftSectionComponent,
    FoodRestrictionsFormComponent,
    SongSuggestionsComponent,
    InstagramHashtagComponent,
    RsvpComponent,
    FooterNamesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'wedding-landing-page';
}
