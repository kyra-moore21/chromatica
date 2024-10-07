import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Emotions } from '../../../../../supabase/functions/emotion-event-enum';
import { IonicModule } from '@ionic/angular';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-emotion-selection',
  templateUrl: './emotion-selection.component.html',
  imports: [IonicModule],
  styleUrls: ['./emotion-selection.component.scss'],
  standalone: true
})
export class EmotionSelectionComponent  implements OnInit {
  @Input() emotions: number[] = [];
  @Input() selectedEmotion: number = Emotions.None;
  @Output() selectedEmotionChange = new EventEmitter<number>();
  Emotions = Emotions;

  constructor(private formService: FormService ) { }
  
  ngOnInit() {}

 toggleEmotions(emotion: number){
  this.selectedEmotion = this.formService.toggleSelection(this.selectedEmotion, emotion, Emotions.None);
  console.log('Selected Emotion:', this.selectedEmotion);
 }

 proceedToEventSelection(){
  console.log(this.selectedEmotion); 
  this.selectedEmotionChange.emit(this.selectedEmotion);
  }
 }

