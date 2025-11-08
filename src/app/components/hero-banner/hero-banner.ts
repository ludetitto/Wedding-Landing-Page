import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.html',
  styleUrls: ['./hero-banner.css']
})
export class HeroBanner implements OnInit, OnDestroy {
  images: string[] = [
    'IMG-20251026-WA0001.jpg',
    'IMG-20251026-WA0002.jpg',
    'IMG-20251026-WA0003.jpg',
    'IMG-20251026-WA0004.jpg',
    'IMG-20251026-WA0005.jpg',
    'IMG-20251026-WA0006.jpg',
    'IMG-20251026-WA0007.jpg',
    'IMG-20251026-WA0008.jpg',
    'IMG-20251026-WA0009.png'
  ];

  current = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  startAutoplay(): void {
    this.stopAutoplay();
    this.intervalId = setInterval(() => this.next(), 4500);
  }

  stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  next(): void {
    this.current = (this.current + 1) % this.images.length;
  }

  prev(): void {
    this.current = (this.current - 1 + this.images.length) % this.images.length;
  }

  goTo(i: number): void {
    this.current = i;
  }

  pause(): void { this.stopAutoplay(); }
  resume(): void { this.startAutoplay(); }
}
