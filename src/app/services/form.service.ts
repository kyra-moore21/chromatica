import { Injectable } from '@angular/core';
import { GeneratedSong } from '../models/generated-song';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private recommendation: GeneratedSong[] = [];
  constructor() {}

  //convert enum to name
  convertEnumName(enumType: any, value: number): string {
    const enumEntry = Object.entries(enumType).find(
      ([key, val]) => val === value
    );
    return enumEntry ? enumEntry[0] : 'None';
  }

  //toggle selection between enum and none
  toggleSelection(
    currentSelection: any,
    newSelection: any,
    enumNoneValue: any
  ): any {
    return currentSelection === newSelection ? enumNoneValue : newSelection;
  }
  setRecommendation(recommendation: GeneratedSong[]) {
    this.recommendation = recommendation;
  }
  getRecommendation() {
    return this.recommendation;
  }
}
