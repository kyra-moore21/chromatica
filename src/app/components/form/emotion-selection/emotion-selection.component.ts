import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Emotions } from '../../../../../supabase/functions/emotion-event-enum';
import { IonicModule } from '@ionic/angular';
import { FormService } from '../../../services/form.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-emotion-selection',
  templateUrl: './emotion-selection.component.html',
  imports: [IonicModule, CommonModule],
  styleUrls: ['./emotion-selection.component.scss'],
  standalone: true
})
export class EmotionSelectionComponent implements OnInit {
  @Input() emotions: number[] = [];
  @Input() selectedEmotion: number = Emotions.None;
  @Output() selectedEmotionChange = new EventEmitter<number>();
  Emotions = Emotions;
 
  constructor(
    private formService: FormService,
  ) {}
  ngOnInit() {

    
  }
  



  getSize(emotion: number): { width: string; height: string; fontSize: string } {
    const emotionName = Emotions[emotion].toLowerCase();
    let size: number;

    if (emotionName.length <= 3) {
      size = 65;  
    } else if (emotionName.length <= 5) {
      size = 75; 
    } else if (emotionName.length <= 8) {
      size = 90; 
    } else {
      size = 125; 
    }
  
    const fontSize = Math.max(12, Math.floor(size * 0.125)); 
  
    return {
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${fontSize}px`
    };
  }

  toggleEmotions(emotion: number) {
    this.selectedEmotion = this.formService.toggleSelection(this.selectedEmotion, emotion, Emotions.None);
    console.log('Selected Emotion:', this.selectedEmotion);
  }

  proceedToEventSelection() {
    console.log(this.selectedEmotion);
    this.selectedEmotionChange.emit(this.selectedEmotion);
  }

  isSelected(emotion: number): boolean {
    return this.selectedEmotion === emotion;
  }


}