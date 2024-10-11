import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Events } from '../../../../../supabase/functions/emotion-event-enum';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-event-selection',
  templateUrl: './event-selection.component.html',
  styleUrls: ['./event-selection.component.scss'],
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
  
  proceedToGenreSelection(){
      console.log(this.selectedEvent);
      this.selectedEventsChange.emit(this.selectedEvent);   
  }
  spiltOnCapital(event: string): string{
    return this.formService.splitOnCapital(event);
  }

}
