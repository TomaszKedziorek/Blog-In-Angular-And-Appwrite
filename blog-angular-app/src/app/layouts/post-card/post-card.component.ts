import { Component, Input } from '@angular/core';
import { Post } from 'src/app/modules/post';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {

  @Input()
  post!: { id: string, data: Post };

}
