import { Component, OnDestroy, OnInit } from '@angular/core';
import { Models } from 'appwrite';
import { Category } from 'src/app/modules/category';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-category-navbar',
  templateUrl: './category-navbar.component.html',
  styleUrls: ['./category-navbar.component.css']
})
export class CategoryNavbarComponent implements OnInit, OnDestroy {

  public categories!: Array<{ id: string, data: Category }>;

  constructor(private appwrite: AppwriteService) { }

  ngOnInit(): void {
    this.appwrite.getDocumentList<Category>(this.appwrite.categoryCollectionId).subscribe(result => {
      this.categories = result;
      this.appwrite.subscribeForArray(this.categories,this.appwrite.categoryCollectionId);
    });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

}
