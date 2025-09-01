import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroBanner } from './components/hero-banner/hero-banner';
import { GiftsSection } from './gifts-section/gifts-section';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeroBanner, GiftsSection],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'wedding-landing-page';
}
