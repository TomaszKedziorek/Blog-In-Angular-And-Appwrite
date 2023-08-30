import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Models } from 'appwrite';
import { Post } from 'src/app/modules/post';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.css']
})
export class SinglePostComponent implements OnInit, OnDestroy {

  public post!: Post;
  public categoryId!: string;
  public similarPosts!: Array<{ id: string, data: Post }>;
  public postId!: string;

  constructor(private appwrite: AppwriteService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(result => {
      this.postId = result['id'];

      this.loadMainPost(this.postId).subscribe(result => {
        this.post = result;
        this.categoryId = (<Models.Document><unknown>result.category).$id;
        this.incrementViewCount();
        this.loadSimilarPosts(this.categoryId);
      });
    });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadMainPost(postId: string) {
    return this.appwrite.getDocument<Post>(this.appwrite.postCollectionId, postId);
  }

  private loadSimilarPosts(categoryId: string) {
    let query: string[] = [
      this.appwrite.equalQuery("category", [categoryId]),
      this.appwrite.notEqualQuery("$id", [this.postId]),
      this.appwrite.limitQuery(4)
    ];
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId, query)
      .subscribe(result => {
        this.similarPosts = result;
      });
  }

  private incrementViewCount() {
    this.post.views += 1;
    this.appwrite.updateDocument(
      this.appwrite.postCollectionId,
      this.postId,
      { views: this.post.views }
    );
  }

}
