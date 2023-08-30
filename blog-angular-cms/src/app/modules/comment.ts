export interface Comment {
  name: string,
  comment: string,
  postId: string,
  createdAt: Date
  parentCommentId: string | null,
  approved: boolean,
  deletedComment: string;
  deleted: boolean;
}
