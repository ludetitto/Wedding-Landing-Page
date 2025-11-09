import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-suggestions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-suggestions.html',
  styleUrls: ['./song-suggestions.css']
})
export class SongSuggestionsComponent implements OnInit {
  feedback: string | null = null;
  loading: boolean = false;
  // Keep instructions visible by default as requested
  showInstructions = true;

  ngOnInit(): void {

  }
  openPlaylist() {
    // Instructions are persistent; anchor opens the playlist. No auto-hide.
    this.showInstructions = true;
  }
}
