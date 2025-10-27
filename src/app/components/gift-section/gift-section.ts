import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gift-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gift-section.html',
  styleUrls: ['./gift-section.css']
})
export class GiftSectionComponent {
  // Información de la cuenta bancaria o alias
  bankInfo = {
    alias: 'casamiento.flor.leo',
    accountHolder: 'Florencia De Titto',
    cbu: '2850590940094265473710',
    accountType: 'Cuenta Corriente'
  };

  // Estado para mostrar mensaje de copiado
  copySuccessMessage = '';

  async copyToClipboard(text: string, type: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.copySuccessMessage = `${type} copiado al portapapeles`;
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        this.copySuccessMessage = '';
      }, 3000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      // Fallback para navegadores que no soportan la API del portapapeles
      this.fallbackCopyTextToClipboard(text, type);
    }
  }

  // Método fallback para copiar texto
  fallbackCopyTextToClipboard(text: string, type: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Evitar scroll hacia el textarea
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.copySuccessMessage = `${type} copiado al portapapeles`;
        setTimeout(() => {
          this.copySuccessMessage = '';
        }, 3000);
      }
    } catch (err) {
      console.error('Fallback: No se pudo copiar', err);
    }
    
    document.body.removeChild(textArea);
  }
}