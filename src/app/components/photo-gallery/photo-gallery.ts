import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PhotoItem {
  src: string;
  alt: string;
  id: number;
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.html',
  styleUrls: ['./photo-gallery.css']
})
export class PhotoGalleryComponent {
  @Input() photos: PhotoItem[] = [];
  @Input() title: string = '';
  @Input() showTitle: boolean = true;
  
  isModalOpen = false;
  modalImageSrc = '';

  /* Carousel state */
  current = 0;
  private intervalId: any;

  // Nombres de archivos que deben mostrarse en formato vertical
  private verticalFilenames = [
    'IMG-20251026-WA0004.jpg',
    'IMG-20251026-WA0005.jpg'
  ];

  isVertical(photo: PhotoItem): boolean {
    if (!photo || !photo.src) return false;
    // comprobar si la ruta contiene alguno de los nombres listados
    const src = photo.src.toString();
    return this.verticalFilenames.some(name => src.endsWith(name) || src.indexOf(name) !== -1);
  }

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  openModal(imageSrc: string) {
    this.modalImageSrc = imageSrc;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalImageSrc = '';
    document.body.style.overflow = 'auto';
  }

  /* Carousel controls */
  private startAutoplay() {
    this.stopAutoplay();
    // cambiar slide cada 4000ms (4 segundos)
    this.intervalId = setInterval(() => this.next(), 4000);
  }

  private stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  next() {
    if (!this.photos || this.photos.length === 0) return;
    this.current = (this.current + 1) % this.photos.length;
  }

  prev() {
    if (!this.photos || this.photos.length === 0) return;
    this.current = (this.current - 1 + this.photos.length) % this.photos.length;
  }

  goTo(i: number) {
    if (!this.photos || this.photos.length === 0) return;
    this.current = i;
  }

  pause() { this.stopAutoplay(); }
  resume() { this.startAutoplay(); }
}