import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Events } from '../../../../../supabase/functions/emotion-event-enum';
import { FormService } from '../../../services/form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-selection',
  templateUrl: './event-selection.component.html',
  styleUrls: ['./event-selection.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class EventSelectionComponent  implements OnInit {
  @Input() events: number[] = [];
  @Input() selectedEvent: number = Events.None;
  @Output() selectedEventsChange = new EventEmitter<number>();
  Events= Events;
  constructor(private formService: FormService) { }

  ngOnInit() {}

  toggleEvents(event: number){
  this.selectedEvent = this.formService.toggleSelection(this.selectedEvent, event, Events.None);
  console.log('Selected Event:', this.selectedEvent);
  }
  getSize(event: number): { width: string; height: string; fontSize: string } {
    const eventName = Events[event].toLowerCase();
  let size: number;

    

    if (eventName.length <= 6) {
      size = 70;
    } else if (eventName.length <= 9) {
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
  proceedToGenreSelection(){
      console.log(this.selectedEvent);
      this.selectedEventsChange.emit(this.selectedEvent);   
  }
  spiltOnCapital(event: string): string{
    return this.formService.splitOnCapital(event);
  }

}
