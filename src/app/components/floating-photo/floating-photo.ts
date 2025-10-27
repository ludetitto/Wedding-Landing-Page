import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-photo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-photo.html',
  styleUrls: ['./floating-photo.css']
})
export class SectionPhotoComponent {
  @Input() photos: { src: string; alt: string; id: number }[] = [];
  @Input() layout: 'single-center' | 'single-left' | 'single-right' | 'double' = 'single-center';
  
  isModalOpen = false;
  modalImageSrc = '';

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
}