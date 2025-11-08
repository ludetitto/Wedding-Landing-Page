import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.html',
  styleUrls: ['./countdown.css']
})
export class CountdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() target?: string; // ISO date string or parsable date

  days = 0;
  hours = '00';
  mins = '00';
  secs = '00';
  finished = false;
  displayText = '';
  // Animation flags
  dayDrop = false;
  flipHours = false;
  flipMins = false;
  flipSecs = false;

  private intervalId?: number;
  // default target: March 28, 2026 18:30 (month is 0-based -> 2 = March)
  private targetDate = new Date(2026, 2, 28, 18, 30, 0);
  // When used as a top-level component, keep fixed in corner
  isFixed = true;
  private prevDays = -1;
  private prevSecs = -1;
  private prevHours = -1;
  private prevMins = -1;
  // host element reference for reparenting to body so overlay isn't clipped
  private hostElement: HTMLElement | null = null;
  // inner wrapper inside the host (the div.floating-countdown) — we add overlay class here
  private hostInner: HTMLElement | null = null;

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}


  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    // remove overlay class and host element from body if we moved it
    try {
      if (this.hostInner) {
        try { this.renderer.removeClass(this.hostInner, 'overlay'); } catch (e) {}
        this.hostInner = null;
      }
      if (this.hostElement && this.hostElement.parentElement) {
        this.renderer.removeChild(this.hostElement.parentElement, this.hostElement);
      }
    } catch (e) {}
  }
  ngOnInit(): void {
    if (this.target) {
      const parsed = new Date(this.target);
      if (!isNaN(parsed.getTime())) {
        this.targetDate = parsed;
      }
    }

    this.update();
    // Use a precise 1s interval; keep reference so we can clear it when finished
    this.intervalId = window.setInterval(() => this.update(), 1000);
  }

  ngAfterViewInit(): void {
    // Move the component host to document.body so it overlays everything and is not clipped
    try {
      this.hostElement = this.el.nativeElement as HTMLElement;
      if (this.hostElement && this.hostElement.parentElement !== document.body) {
        this.renderer.appendChild(document.body, this.hostElement);
        try {
          // Prefer to mark the inner .floating-countdown so our CSS rules apply
          const inner = this.hostElement.querySelector('.floating-countdown') as HTMLElement | null;
          if (inner) {
            this.hostInner = inner;
            this.renderer.addClass(inner, 'overlay');
          } else {
            this.renderer.addClass(this.hostElement, 'overlay');
          }
        } catch (e) {}
      }
    } catch (e) {
      this.hostElement = null;
    }
  }

  private update() {
    const now = Date.now();
    const diff = Math.max(0, this.targetDate.getTime() - now);

    if (diff <= 0) {
      this.finished = true;
      this.displayText = '¡Hoy es la fiesta!';
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }
      try { this.cdr.detectChanges(); } catch (e) {}
      return;
    }
    const newDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const newHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const newMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const newSecs = Math.floor((diff % (1000 * 60)) / 1000);

    // Trigger day drop animation when days decrement (CSS-only)
    if (this.prevDays >= 0 && newDays !== this.prevDays) {
      this.dayDrop = true;
      setTimeout(() => this.dayDrop = false, 700);
    }
    this.prevDays = newDays;
    this.days = newDays;

    // Trigger flips for hours/mins/secs when they change (CSS-only)
    if (this.prevHours >= 0 && newHours !== this.prevHours) {
      this.flipHours = true;
      setTimeout(() => { this.flipHours = false; try { this.cdr.detectChanges(); } catch(e){} }, 320);
    }
    if (this.prevMins >= 0 && newMins !== this.prevMins) {
      this.flipMins = true;
      setTimeout(() => { this.flipMins = false; try { this.cdr.detectChanges(); } catch(e){} }, 320);
    }
    if (this.prevSecs >= 0 && newSecs !== this.prevSecs) {
      this.flipSecs = true;
      setTimeout(() => { this.flipSecs = false; try { this.cdr.detectChanges(); } catch(e){} }, 220);
    }

    this.prevHours = newHours;
    this.prevMins = newMins;
    this.prevSecs = newSecs;

    this.hours = this.pad(newHours);
    this.mins = this.pad(newMins);
    this.secs = this.pad(newSecs);

    // Update accessible text (kept for screen readers)
    const dayLabel = newDays === 1 ? 'día,' : 'días,';
    if (newDays > 0) {
      this.displayText = `Faltan ${newDays} ${dayLabel} ${this.hours} horas, ${this.mins} minutos y ${this.secs} segundos para la fiesta`;
    } else {
      this.displayText = `Faltan ${this.hours}:${this.mins}:${this.secs} para la fiesta`;
    }

    // ensure Angular picks up DOM changes immediately
    try { this.cdr.detectChanges(); } catch (e) {}
  }
  

  // Exposed to template: accept number or already-padded string
  public pad(n: number | string) {
    if (typeof n === 'string') return n;
    return n < 10 ? '0' + n : String(n);
  }
}
