import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppwriteService } from '../services/appwrite.service';
import { Category } from '../modules/category';
import { Models } from 'appwrite';
import { Observable, concatWith, tap } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {

  public categories!: Array<{ id: string, data: Category }>;
  public categoryValue!: string;
  public categoryId!: string;
  public formStatus: string = "Add";

  constructor(private readonly appwrite: AppwriteService) { }

  public ngOnInit() {
    this.appwrite.getDocumentList<Category>(this.appwrite.categoryCollectionId)
      .subscribe(result => {
        this.categories = result;
        this.categories = this.appwrite.subscribeForArray(this.categories, this.appwrite.categoryCollectionId);
      });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  public onSubmit(formData: any): void {
    let data: Category = {
      category: formData.value.category,
    };
    switch (this.formStatus) {
      case "Add":
        const documentId: string = (Math.floor((Math.random() * 1000) + Date.now())).toString(16);
        this.appwrite.addDocument(this.appwrite.categoryCollectionId, data, documentId);
        this.resetFormStatus();
        break;
      case "Edit":
        this.appwrite.updateDocument(this.appwrite.categoryCollectionId, this.categoryId, data);
        this.resetFormStatus();
        break;
      default:
        break;
    }
    formData.reset();
  }

  public onEdit(category: { id: string, data: Category }) {
    this.categoryValue = category.data.category;
    this.categoryId = category.id;
    this.formStatus = "Edit";
    document.getElementById('categoryForm')?.scrollIntoView();
  }

  public onDelete(id: string) {
    this.appwrite.deleteDocument(this.appwrite.categoryCollectionId, id);
    this.resetFormStatus();
    document.getElementById('categoryForm')?.scrollIntoView();
  }

  public resetFormStatus(): void {
    this.formStatus = "Add";
    this.categoryValue = "";
    this.categoryId = "";
    document.getElementById('categoryForm')?.scrollIntoView();
  }

}
