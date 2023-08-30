import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AppwriteService } from 'src/app/services/appwrite.service';
import { Comment } from '../../modules/comment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public postId!: string;
  @Input() public isReply!: boolean;
  @Input() public comments: Array<{ id: string, data: Comment }> = [];

  constructor(private appwrite: AppwriteService, private route: ActivatedRoute) { }

  public ngOnInit(): void {
    if (this.isReply == false)
      this.loadComments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();    
  }
  public ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadComments(): void {
    let queries: string[] = [
      this.appwrite.equalQuery("postId", [this.postId]),
      this.appwrite.equalQuery("approved", [true]),
      this.appwrite.isNullQuery("parentCommentId"),
      this.appwrite.orderAscQuery("createdAt")
    ];
    this.appwrite.getDocumentList<Comment>(this.appwrite.commentsCollectionId, queries)
      .subscribe(result => {
        this.comments = result;
      });
  }

}
