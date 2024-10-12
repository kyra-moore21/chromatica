import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }
  //convert enum to name
  convertEnumName(enumType: any, value: number):string{
    const enumEntry = Object.entries(enumType).find(([key, val]) => val === value);
    return enumEntry ? enumEntry[0] : 'None';
  }

  splitOnCapital(str: string): string {
    const expections = ['RnB', 'EDM']
    if(expections.includes(str)){
      return str;
    }
    return str.split(/(?=[A-Z])/).join(' ').toLowerCase();
  }

  
  //toggle selection between enum and none
  toggleSelection(currentSelection: any, newSelection: any, enumNoneValue: any): any{
    return currentSelection === newSelection ? enumNoneValue : newSelection;
  }
}
