import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from 'src/app/modules/post';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  public postsFeatured!: Array<{ id: string, data: Post }>;
  public postsLatest!: Array<{ id: string, data: Post }>;

  constructor(private appwrite: AppwriteService) { }

  ngOnInit(): void {
    this.loadFeaturedPosts();
    this.loadLatestPosts()
  }

  private loadFeaturedPosts() {
    const query: string[] = [
      this.appwrite.equalQuery("isFeatured", [true]),
      this.appwrite.orderDescQuery("$createdAt"),
      this.appwrite.limitQuery(4),
    ]
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId, query)
      .subscribe(result => {
        this.postsFeatured = result;
      });
  }

  private loadLatestPosts() {
    const query: string[] = [
      this.appwrite.orderDescQuery("createdAt"),
      this.appwrite.limitQuery(9),
    ]
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId, query)
      .subscribe(result => {
        this.postsLatest = result;
        this.appwrite.subscribeForArray<Post>(this.postsLatest, this.appwrite.postCollectionId);
      });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

}
