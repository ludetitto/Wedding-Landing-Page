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

  // Use a timeout-based loop aligned to the system clock to avoid interval drift
  private timerId?: number;
  private running = false;
  // default target: March 28, 2026 18:30 (month is 0-based -> 2 = March)
  private targetDate = new Date(2026, 2, 28, 18, 30, 0);
  // When used as a top-level component, keep fixed in corner
  isFixed = true;
  private prevDays = -1;
  private prevSecs = -1;
  private prevHours = -1;
  private prevMins = -1;
  // host element reference (kept but we no longer reparent)
  private hostElement: HTMLElement | null = null;
  private hostInner: HTMLElement | null = null;
  private lastPointerId: number | null = null;

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}


  ngOnDestroy(): void {
    this.stopTimer();
    // cleanup references
    try {
      this.hostInner = null;
      this.hostElement = null;
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
    // start a timeout loop aligned to the next full second for precise updates
    this.startTimer();
  }

  ngAfterViewInit(): void {
    // Keep the component in-place where it's declared (e.g., inside hero under the text)
    try {
      this.hostElement = this.el.nativeElement as HTMLElement;
      // prefer in-flow rendering; don't reparent to document.body
      // find inner wrapper for future reference
      try {
        const inner = this.hostElement.querySelector('.floating-countdown') as HTMLElement | null;
        if (inner) {
          this.hostInner = inner;
        }
      } catch (e) {}
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
      // stop the timer loop when finished
      this.stopTimer();
      try { this.cdr.detectChanges(); } catch (e) {}
      return;
    }
    const newDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const newHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const newMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const newSecs = Math.floor((diff % (1000 * 60)) / 1000);

    this.days = newDays;
    this.hours = this.pad(newHours);
    this.mins = this.pad(newMins);
    this.secs = this.pad(newSecs);

    // Update accessible/display text
    if (newDays > 0) {
      this.displayText = `Faltan ${newDays} días, ${this.hours}:${this.mins}:${this.secs}`;
    } else {
      this.displayText = `Faltan ${this.hours}:${this.mins}:${this.secs}`;
    }

    try { this.cdr.detectChanges(); } catch (e) {}
  }

  // Exposed to template: accept number or already-padded string
  public pad(n: number | string) {
    if (typeof n === 'string') return n;
    return n < 10 ? '0' + n : String(n);
  }

  // Timer loop: align first tick to next full second, then schedule ~1000ms ticks
  private startTimer() {
    this.stopTimer();
    this.running = true;
    const now = Date.now();
    const delay = 1000 - (now % 1000);
    this.timerId = window.setTimeout(() => this.timerTick(), delay);
  }

  private timerTick() {
    if (!this.running) return;
    this.update();
    this.timerId = window.setTimeout(() => this.timerTick(), 1000);
  }

  private stopTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    this.running = false;
  }

}

