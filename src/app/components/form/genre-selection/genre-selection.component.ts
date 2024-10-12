import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Genres } from '../../../../../supabase/functions/emotion-event-enum';
import { FormService } from '../../../services/form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genre-selection',
  templateUrl: './genre-selection.component.html',
  styleUrls: ['./genre-selection.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class GenreSelectionComponent  implements OnInit {
@Input() genres: number[] = [];
@Input() selectedGenre: number = Genres.None;
@Output() selectedGenresChange = new EventEmitter<number>();
// @Input() generationType: string;

genreButtons: any[] = [];

Genres = Genres;
  constructor(private formService: FormService) { }

  ngOnInit() {
  }
  getSize(genre: number): { width: string; height: string; fontSize: string } {
    const genreName = Genres[genre].toLowerCase();
    let size: number;

    if (genreName.length <= 4) {
      size = 70;
    } else if (genreName.length <= 7) {
      size = 90;
    } else {
      size = 120
    }
  
    const fontSize = Math.max(12, Math.floor(size * 0.125)); 
  
    return {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${fontSize}px`
    };
  }

  toggleGenres(genre: number){
   this.selectedGenre = this.formService.toggleSelection(this.selectedGenre, genre, Genres.None);
   console.log('Selected Genre:', this.selectedGenre);
   this.selectedGenresChange.emit(this.selectedGenre);
  }

  splitOnCapital(genre: string): string {
    return this.formService.splitOnCapital(genre);
  }
  
}
