import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Genres } from '../../../../../supabase/functions/emotion-event-enum';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-genre-selection',
  templateUrl: './genre-selection.component.html',
  styleUrls: ['./genre-selection.component.scss'],
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

  toggleGenres(genre: number){
   this.selectedGenre = this.formService.toggleSelection(this.selectedGenre, genre, Genres.None);
   console.log('Selected Genre:', this.selectedGenre);
   this.selectedGenresChange.emit(this.selectedGenre);
  }

  splitOnCapital(genre: string): string {
    return this.formService.splitOnCapital(genre);
  }
  
}
