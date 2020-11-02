import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Animal } from './animal.model';

@Injectable({ providedIn: 'root' })
export class AnimalsService {
  private animals: Animal[] = [];
  private animalsUpdated = new Subject<{ animals: Animal[]; animalCount: number }>();


  constructor(private http: HttpClient, private router: Router) {}

  getAnimals(animalsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${animalsPerPage}&page=${currentPage}`;
    this.http
    .get<{ message: string; animals: any; maxAnimals: number }>(
      "http://localhost:3000/api/animals" + queryParams
      )
    .pipe(map((animalData) => {
      return {
        animals: animalData.animals.map(animal => {
          return {
            title: animal.title,
            content: animal.content,
            id: animal._id,
            imagePath: animal.imagePath,
            creator: animal.creator
          };
        }),
        maxAnimals: animalData.maxAnimals
      };
    })
    )
    .subscribe((transformedAnimalData) => {
      this.animals = transformedAnimalData.animals;
      this. animalsUpdated.next({
        animals: [...this.animals],
        animalCount: transformedAnimalData.maxAnimals
      });
    });
  }

  getAnimalUpdateListener() {
    return this.animalsUpdated.asObservable();
  }

  getAnimal(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>('http://localhost:3000/api/animals/' + id);
  }

  addAnimal(title: string, content: string, image: File) {
    const animalData = new FormData();
    animalData.append("title", title);
    animalData.append("content", content);
    animalData.append("image", image, title);
    this.http.post<{ message: string, animal: Animal }>('http://localhost:3000/animals', animalData)
    .subscribe(responseData => {
      this.router.navigate(['animal-list']);  //check for correct routing '/'
    });
  }

  updateAnimal(id: string, title: string, content: string, image: File | string ) {
    let animalData: Animal | FormData;
    if (typeof image ==="object") {
      animalData = new FormData();
      animalData.append("id", id);
      animalData.append("title", title);
      animalData.append("content", content);
      animalData.append("image", image, title);
    } else {
      animalData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
    .put('http://localhost:3000/api/animals/' + id, animalData)
      .subscribe(response => {
        this.router.navigate(["animal-list"]);
      });
  }

  deleteAnimal(animalId: string) {
    return this.http.delete('http://localhost:3000/api/animals/' + animalId)
  }
}
