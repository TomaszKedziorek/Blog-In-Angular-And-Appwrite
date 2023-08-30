import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Comment } from '../../modules/comment';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-single-comment',
  templateUrl: './single-comment.component.html',
  styleUrls: ['./single-comment.component.css']
})
export class SingleCommentComponent implements OnInit, OnDestroy {

  public replyTo: boolean = false;
  public viewReplys: boolean = false;

  @Input() postId!: string;
  @Input() comment!: { id: string, data: Comment };
  public replies: Array<{ id: string, data: Comment }> = [];
  constructor(private appwrite: AppwriteService) { }
  public isReply!: boolean;

  ngOnInit(): void {
    if (this.comment.data.parentCommentId == null)
      this.isReply = false;
    else
      this.isReply = true;
    this.loadReplies();
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadReplies(): void {
    let queries: string[] = [
      this.appwrite.equalQuery("postId", [this.postId]),
      this.appwrite.equalQuery("parentCommentId", [this.comment.id]),
      this.appwrite.equalQuery("approved", [true]),
      this.appwrite.orderAscQuery("createdAt")
    ];
    this.appwrite.getDocumentList<Comment>(this.appwrite.commentsCollectionId, queries)
      .subscribe(result => {
        this.replies = result;
      });
  }
}
