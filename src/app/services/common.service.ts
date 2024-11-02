import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  lowercaseRemoveStop(text: string) {
    //take the text and make it all lowercase and remove the fullstop
    return text.toLowerCase().trim();
  }
}
