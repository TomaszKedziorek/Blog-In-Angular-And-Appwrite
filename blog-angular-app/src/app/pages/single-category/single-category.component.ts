import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from 'src/app/modules/post';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-single-category',
  templateUrl: './single-category.component.html',
  styleUrls: ['./single-category.component.css']
})
export class SingleCategoryComponent implements OnInit, OnDestroy {

  public category!: { id: string, category: string };
  public posts!: Array<{ id: string, data: Post }>;

  constructor(private appwrite: AppwriteService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(result => {
      this.category = <{ id: string, category: string }>result;
      if (this.category.category.toLowerCase() == "all") {
        this.loadCategoryPosts();
      } else {
        this.loadCategoryPosts(this.category.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadCategoryPosts(categoryId: string | undefined = undefined) {
    const query: string[] = [this.appwrite.orderDescQuery("createdAt")];
    if (categoryId) {
      query.push(this.appwrite.equalQuery("category", [categoryId]))
    }
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId, query)
      .subscribe(result => {
        this.posts = result;
        this.appwrite.subscribeForArray(this.posts, this.appwrite.postCollectionId);
      });
  }

}
