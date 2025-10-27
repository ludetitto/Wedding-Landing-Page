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