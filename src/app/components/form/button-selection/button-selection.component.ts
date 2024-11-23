import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Emotions,
  Events,
  Genres,
} from '../../../../../supabase/functions/emotion-event-enum';

@Component({
  selector: 'app-button-selection',
  templateUrl: './button-selection.component.html',
  styleUrls: ['./button-selection.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class ButtonSelectionComponent implements OnInit {
  @Input() title: string = '';
  @Input() items: any[] = [];
  @Input() selectedItem: any;
  @Input() defaultValue: any;
  @Input() enumType: 'Emotions' | 'Events' | 'Genres' = 'Emotions';
  @Input() isGenreSelection: boolean = false;
  @Input() generationType: 'Song' | 'Playlist' = 'Song';
  @Output() selectedItemChange = new EventEmitter<any>();
  @Output() proceed = new EventEmitter<void>();

  filteredItems: any[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.items = this.shuffleArray(this.items);
    this.filteredItems = this.items;
  }

  shuffleArray(array: any[]): any[] {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getItemDisplay(item: any): string {
    switch (this.enumType) {
      case 'Emotions':
        return Emotions[item].toLowerCase();
      case 'Events':
        return this.splitOnCapital(Events[item]);
      case 'Genres':
        return this.splitOnCapital(Genres[item]);
      default:
        return item.toString();
    }
  }

  splitOnCapital(str: string): string {
    const expections = ['RnB', 'EDM'];
    if (expections.includes(str)) {
      return str;
    }
    return str
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase();
  }

  getSize(item: any): { width: string; height: string; fontSize: string } {
    const displayText = this.getItemDisplay(item).toLowerCase();
    let size: number;

    if (displayText.length <= 4) {
      size = 70;
    } else if (displayText.length <= 7) {
      size = 90;
    } else {
      size = 120;
    }

    const fontSize = Math.max(12, Math.floor(size * 0.125));

    return {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${fontSize}px`,
    };
  }

  getSearchPlaceholder(title: string): string {
    // Extract the last word from the title
    const words = title.split(' ');
    const category = words[words.length - 1].toLowerCase();
    if (category === 'genre') {
      this.isGenreSelection = true;
    }
    return category;
  }

  toggleSelection(item: any) {
    this.selectedItem = this.selectedItem === item ? this.defaultValue : item;
    this.selectedItemChange.emit(this.selectedItem);
  }

  searchItems() {
    if (this.searchTerm.trim() === '') {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter((item) =>
        this.getItemDisplay(item)
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }
  }
  getButtonText(): string {
    if (this.isGenreSelection) {
      return this.generationType === 'Playlist' ? 'Continue' : 'Generate Song';
    }
    return 'Continue';
  }
}
