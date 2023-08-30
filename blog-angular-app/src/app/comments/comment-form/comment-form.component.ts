import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Comment } from '../../modules/comment';
import { AppwriteService } from 'src/app/services/appwrite.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.css']
})
export class CommentFormComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public postId!: string;
  @Input() public parentCommentId: string | null | undefined;
  public isComment: boolean = true;
  public formStatus: string = "Comment";
  public commentAddedSuccess: boolean = false;
  public commentAddedFailed: boolean = false;

  constructor(private appwrite: AppwriteService) { }


  ngOnInit(): void {
    if (this.parentCommentId) {
      this.isComment = false;
      this.formStatus = "Reply";
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.commentAddedSuccess = false;
    this.commentAddedFailed = false;
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  public onSubmit(formValues: any) {
    if (this.parentCommentId == undefined)
      this.parentCommentId = null;
    const comment: Comment = {
      name: formValues.value.name,
      comment: formValues.value.comment,
      postId: this.postId,
      createdAt: new Date(),
      parentCommentId: this.parentCommentId,
      approved: false
    };
    this.appwrite.addDocument(this.appwrite.commentsCollectionId, comment)
      .then(res => {
        formValues.reset();
        this.commentAddedSuccess = true;
        this.commentAddedFailed = false;
      }).catch(err => {
        this.commentAddedFailed = true;
      });
  }
}
