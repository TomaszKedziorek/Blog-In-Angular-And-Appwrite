import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppwriteService } from 'src/app/services/appwrite.service';
import { Post } from 'src/app/modules/post';
import { Router } from '@angular/router';
import { Models } from 'appwrite';
import { Category } from 'src/app/modules/category';
import { Comment } from '../../modules/comment';
import { map } from 'rxjs';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.css'],
})
export class AllPostComponent implements OnInit, OnDestroy {

  public posts!: Array<{ id: string, data: Post }>;
  public postsToDisplay!: Array<{ id: string, data: Post }>;
  public categories!: Array<{ id: string, data: Category }>;

  constructor(private appwrite: AppwriteService, private router: Router) { }

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories()
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadPosts() {
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId)
      .subscribe(result => {
        this.posts = result;
        this.onSelectedCategory();
        this.appwrite.subscribeForArray<Post>(this.posts, this.appwrite.postCollectionId);
      });
  }
  private loadCategories() {
    this.appwrite.getDocumentList<Category>(this.appwrite.categoryCollectionId)
      .subscribe(result => {
        this.categories = result;
      });
  }

  public onSelectedCategory(categoryId: string | undefined = undefined): void {
    if (categoryId)
      this.postsToDisplay = this.posts.filter(p => (<Models.Document><unknown>p.data.category).$id == categoryId);
    else
      this.postsToDisplay = this.posts;
  }

  public onDelete(postId: string, imageId: string) {
    this.appwrite.deleteFile(imageId);
    this.appwrite.deleteDocument(this.appwrite.postCollectionId, postId);
    const queries: string[] = [this.appwrite.equalQuery("postId", [postId])];
    let commentsId: string[] = [];
    this.appwrite.getDocumentList(this.appwrite.commentsCollectionId, queries)
      .subscribe(result => {
        result.map(r => {
          commentsId.push(r.id);
        });
        this.deleteRange(commentsId);
      })
  }

  private deleteRange(documentsIdArray: string[]): void {
    this.appwrite.deleteDocumentRange(this.appwrite.commentsCollectionId, documentsIdArray);
  }

  onFeatured(postId: string, isFeatured: boolean): void {
    let data: any = { isFeatured: isFeatured }
    this.appwrite.updateDocument(this.appwrite.postCollectionId, postId, data)
  }

}
