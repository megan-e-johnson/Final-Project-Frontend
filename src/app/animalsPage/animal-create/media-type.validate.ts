import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mediaType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  // const fileReaderObs = Observable.create(
//tried to create my own observable using 'Observable.create
// create method deprecated; using 'new' keyword
  const fileReaderObs = new Observable(
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {
//Uint8Array creates new array of 8bit unsigned integers; lets us look into file to parse media type
//if I get an error use fileReader.result as Array Buffer instead of fileReader.result
const array = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
        let header = "";
        let isValid = false;
        for (let i = 0; i < array.length; i++) {
          header += array[i].toString(16);
        }
        switch (header) {
          case '89504e47':  //these valid patterns show up in PNG and JPEG
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or we could use blob.type
            break;
        }
        if (isValid) {
          observer.next(null);  //null means valid
        } else {
          observer.next({ invalidMediaType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);
    }
  );
  return fileReaderObs;
};