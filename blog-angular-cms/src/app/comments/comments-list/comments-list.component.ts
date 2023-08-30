import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../modules/post';
import { Comment } from '../../modules/comment';
import { Router } from '@angular/router';
import { AppwriteService } from '../../services/appwrite.service';

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.css']
})
export class CommentsListComponent implements OnInit, OnDestroy {

  public comments: Array<{ id: string, data: Comment }> = [];
  public commentsToDisplay: Array<{ id: string, data: Comment }> = [];
  public posts: { [id: string]: Post; } = {};
  private documentsIdArray: string[] = [];

  constructor(private appwrite: AppwriteService, private router: Router) { }

  ngOnInit(): void {
    this.loadPosts();
    this.loadComments();
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  private loadComments() {
    let queries: string[] = [
      this.appwrite.orderAscQuery("approved"),
      this.appwrite.orderAscQuery("postId"),
      this.appwrite.orderAscQuery("parentCommentId"),
      this.appwrite.orderDescQuery("createdAt"),
    ];
    this.appwrite.getDocumentList<Comment>(this.appwrite.commentsCollectionId, queries)
      .subscribe(result => {
        this.comments = result;
        this.appwrite.subscribeForArray(this.comments, this.appwrite.commentsCollectionId);
        this.onSelectedCategory("notApproved");
      });
  }

  public onSelectedCategory(commentsCategory: string): void {
    switch (commentsCategory) {
      case "all":
        this.commentsToDisplay = this.comments;
        break;
      case "approved":
        this.commentsToDisplay = this.comments.filter(c => c.data.approved == true);
        break;
      case "notApproved":
        this.commentsToDisplay = this.comments.filter(c => c.data.approved == false);
        break;
      case "rootComment":
        this.commentsToDisplay = this.comments.filter(c => c.data.parentCommentId == null);
        break;
      case "childComment":
        this.commentsToDisplay = this.comments.filter(c => c.data.parentCommentId != null);
        break;
      default:
        this.commentsToDisplay = this.comments;
        break;
    }
  }

  private loadPosts() {
    this.appwrite.getDocumentList<Post>(this.appwrite.postCollectionId)
      .subscribe(result => {
        result.map(r => {
          this.posts[r.id] = r.data;
        })
      });
  }

  public onApproved(commentId: string, approve: boolean): void {
    this.appwrite.updateDocument(this.appwrite.commentsCollectionId, commentId, { approved: approve });
  }

  public onDelete(comment: { id: string, data: Comment }): void {
    let comentsArray = this.comments.filter(c => c.data.postId == comment.data.postId);
    this.documentsIdArray.push(comment.id);
    this.findAllChildren(comment.id, comentsArray);
    this.deleteRange(this.documentsIdArray);
    this.documentsIdArray = [];
  }

  private findAllChildren(commentId: string, comments: { id: string, data: Comment }[]): void {
    let listOfChildren = comments.filter(c => c.data.parentCommentId == commentId);
    if (listOfChildren.length != 0)
      listOfChildren.forEach(child => {
        this.findAllChildren(child.id, comments);
        if (!this.documentsIdArray.includes(child.id)) {
          this.documentsIdArray.push(child.id);
        }
      });
  }


  private deleteRange(documentsIdArray: string[]): void {
    this.appwrite.deleteDocumentRange(this.appwrite.commentsCollectionId, documentsIdArray);
  }

}
