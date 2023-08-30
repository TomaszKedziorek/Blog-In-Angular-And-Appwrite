import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/modules/category';
import { Post } from 'src/app/modules/post';
import { AppwriteService } from 'src/app/services/appwrite.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit, OnDestroy {

  public postId!: string | null;
  public post!: Post | any;
  public formStatus: string = 'Add New';
  public permalink: string = '';
  public imgSrc: any = './assets/placeholder.jpg';
  public selectedImage: any;
  public categories!: Array<{ id: string, data: Category }>;
  public postForm!: FormGroup;

  constructor(
    private appwrite: AppwriteService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute) {

    this.route.paramMap.subscribe(value => {
      this.postId = value.get('id');

      if (this.postId) {
        this.appwrite.getDocument<Post>(this.appwrite.postCollectionId, this.postId)
          .subscribe(result => {

            this.post = result;

            this.postForm = this.formBuilder.group({
              title: [this.post.title, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
              permalink: [this.post.permalink, Validators.required],
              excerpt: [this.post.excerpt, [Validators.required, Validators.minLength(1), Validators.maxLength(248)]],
              category: [this.post.category.$id, Validators.required],
              image: [''],
              content: [this.post.content, [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]]
            })
            this.imgSrc = this.post.image;
            this.formStatus = "Edit";
          });
      }
      else {
        this.postForm = this.formBuilder.group({
          title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
          permalink: ['', Validators.required],
          excerpt: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(248)]],
          category: ['', Validators.required],
          image: ['', Validators.required],
          content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]]
        })
      }
    })
  }

  get controls() {
    return this.postForm.controls;
  }

  ngOnInit(): void {
    const categoriesId: string = this.appwrite.categoryCollectionId;
    this.appwrite.getDocumentList<Category>(categoriesId).subscribe(result => {
      this.categories = result;
    });
  }

  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }

  public onTitleChange(event: any): void {
    const title: string = event.target.value;
    this.permalink = title.trim().toLowerCase().replace(/\s/g, '-');
    this.controls.permalink.setValue(this.permalink);
  }

  public onImageChange(event: any): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc = e.target?.result;
    }
    reader.readAsDataURL(event.target.files[0]);
    this.selectedImage = event.target.files[0];
  }

  public onSubmit(): void {
    const post: Post = {
      title: this.controls.title.value,
      permalink: this.controls.permalink.value,
      category: this.controls.category.value,
      image: "",
      imageId: "",
      excerpt: this.controls.excerpt.value,
      content: this.controls.content.value,
      isFeatured: false,
      views: 0,
      status: 'new',
      createdAt: new Date(),
    }
    if (this.postId) {
      post.isFeatured = this.post.isFeatured;
      post.views = this.post.views;
      this.saveEditedPost(post);
    } else {
      this.saveNewPost(post);
    }
  }

  private saveNewPost(post: Post): void {
    this.appwrite.addFile(this.selectedImage).subscribe(result => {
      if (result) {
        post.image = result.fileUrl;
        post.imageId = result.fileId;
        this.appwrite.addDocument(this.appwrite.postCollectionId, post);
        this.router.navigate(['/posts']);
      } else {
        this.toastr.error("Post Insert Unuccessfully!");
      }
    });
  }

  private saveEditedPost(post: Post): void {
    const documentId: string = <string>this.postId;
    if (this.selectedImage) {
      this.appwrite.addFile(this.selectedImage).subscribe(result => {
        if (result) {
          post.image = result.fileUrl;
          post.imageId = result.fileId;
          this.appwrite.updateDocument(this.appwrite.postCollectionId, documentId, post)
            .subscribe(() => {
              this.appwrite.deleteFile(this.post.imageId);
              this.router.navigate(['/posts']);
            });
        } else {
          this.toastr.error("Post Insert Unuccessfully!");
        }
      });
    } else {
      post.image = this.post.fileUrl;
      post.imageId = this.post.fileId;
      this.appwrite.updateDocument(this.appwrite.postCollectionId, documentId, post)
        .subscribe(() => {
          this.router.navigate(['/posts']);
        });
    }
  }

}
