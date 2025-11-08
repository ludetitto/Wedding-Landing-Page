import { Component, OnInit, HostListener } from '@angular/core';
import { HeroBanner } from './components/hero-banner/hero-banner';
import { EventDetailsComponent } from './components/event-details/event-details';
import { PhotoGalleryComponent } from './components/photo-gallery/photo-gallery';
import { GiftSectionComponent } from './components/gift-section/gift-section';
import { SongSuggestionsComponent } from './components/song-suggestions/song-suggestions';
import { RsvpComponent } from './components/rsvp/rsvp';
import { FooterNamesComponent } from './components/footer-names/footer-names';
import { CountdownComponent } from './components/countdown/countdown';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroBanner,
    EventDetailsComponent,
    PhotoGalleryComponent,
    GiftSectionComponent,
    SongSuggestionsComponent,
    RsvpComponent,
    FooterNamesComponent,
    CountdownComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'wedding-landing-page';
  
  // Distribución de fotos entre las secciones para masonry
  photosGroup1 = [
    { src: 'assets/wedding/IMG-20251026-WA0001.jpg', alt: 'Momento especial 1', id: 1 },
    { src: 'assets/wedding/IMG-20251026-WA0002.jpg', alt: 'Momento especial 2', id: 2 }
  ];

  photosGroup2 = [
    { src: 'assets/wedding/IMG-20251026-WA0003.jpg', alt: 'Momento especial 3', id: 3 },
    { src: 'assets/wedding/IMG-20251026-WA0004.jpg', alt: 'Momento especial 4', id: 4 },
    { src: 'assets/wedding/IMG-20251026-WA0005.jpg', alt: 'Momento especial 5', id: 5 }
  ];

  photosGroup3 = [
    { src: 'assets/wedding/IMG-20251026-WA0006.jpg', alt: 'Momento especial 6', id: 6 },
    { src: 'assets/wedding/IMG-20251026-WA0007.jpg', alt: 'Momento especial 7', id: 7 },
    { src: 'assets/wedding/IMG-20251026-WA0008.jpg', alt: 'Momento especial 8', id: 8 }
  ];

  ngOnInit() {
    this.initAppleStyleScrollReveal();
    this.initBackgroundVideo();
  }

  initBackgroundVideo() {
    // Asegurar que el video se reproduzca correctamente
    setTimeout(() => {
      const video = document.getElementById('background-video') as HTMLVideoElement;
      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.load();
        
        const playVideo = () => {
          video.play().catch(error => {
            console.log('Video autoplay blocked:', error);
          });
        };

        if (video.readyState >= 2) {
          playVideo();
        } else {
          video.addEventListener('canplay', playVideo);
        }

        // Intentar reproducir en cualquier interacción del usuario
        document.addEventListener('click', () => {
          if (video.paused) {
            video.play().catch(() => {});
          }
        }, { once: true });
      }
    }, 100);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.revealElementsOnScroll();
  }

  initAppleStyleScrollReveal() {
    // Configurar Intersection Observer para animaciones estilo Apple
    const options = {
      root: null,
      rootMargin: '-5% 0px -5% 0px', // Activar cuando el 5% del elemento esté visible
      threshold: 0.1
    };

    // Observer para contenedores y galerías
    const containerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = Array.from(entry.target.parentElement?.children || []).indexOf(entry.target) * 100;
          
          setTimeout(() => {
            entry.target.classList.add('reveal');
          }, delay);
          
          containerObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observer específico para imágenes individuales con delay escalonado
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Delay más corto para imágenes individuales
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const index = siblings.indexOf(entry.target);
          const delay = index * 150; // 150ms entre cada imagen
          
          setTimeout(() => {
            entry.target.classList.add('reveal');
          }, delay);
          
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.2
    });

    // Observar elementos cuando el DOM esté listo
    setTimeout(() => {
      // Observar hero banner (inmediatamente visible, sin delay)
      const heroContent = document.querySelector('.hero-content');
      const heroContainer = document.querySelector('.hero');
      if (heroContent && heroContainer) {
        // El hero banner se anima inmediatamente al cargar
        setTimeout(() => {
          heroContent.classList.add('reveal');
          heroContainer.classList.add('reveal');
        }, 200); // Pequeño delay para una entrada suave
      }

      // Observar contenedores y galerías
      const elementsToReveal = document.querySelectorAll('.container, .photo-gallery');
      elementsToReveal.forEach(el => containerObserver.observe(el));

      // Observar imágenes individuales dentro de las galerías
      const imagesToReveal = document.querySelectorAll('.masonry-item');
      imagesToReveal.forEach(img => imageObserver.observe(img));
    }, 100);
  }

  revealElementsOnScroll() {
    // Método adicional para elementos que necesitan animación manual
    const elements = document.querySelectorAll('.container:not(.reveal), .photo-gallery:not(.reveal), .masonry-item:not(.reveal)');
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Revelar cuando el elemento está 20% visible en la pantalla
      if (rect.top < windowHeight * 0.8) {
        element.classList.add('reveal');
      }
    });
  }
}
