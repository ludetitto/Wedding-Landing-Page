import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-song-suggestions',
  templateUrl: './song-suggestions.html',
  styleUrls: ['./song-suggestions.css']
})
export class SongSuggestionsComponent implements OnInit {
  feedback: string | null = null;
  loading: boolean = false;

  // Playlist where suggestions will be added
  playlistId: string = '1wTn5OtC3L7fLqO0203yla';

  ngOnInit(): void {

  }
}
