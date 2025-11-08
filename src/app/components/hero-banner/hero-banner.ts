import { Component } from '@angular/core';
import { CountdownComponent } from '../countdown/countdown';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: './hero-banner.html',
  styleUrls: ['./hero-banner.css']
})
export class HeroBanner {

}
