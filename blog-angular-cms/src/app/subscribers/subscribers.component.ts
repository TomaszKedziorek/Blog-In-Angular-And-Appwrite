import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlogSubscriber } from '../modules/blog-subscriber';
import { AppwriteService } from '../services/appwrite.service';
import { Models } from 'appwrite';

@Component({
  selector: 'app-subscribers',
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.css']
})
export class SubscribersComponent implements OnInit, OnDestroy {

  public subscribers!: Array<{ id: string, data: BlogSubscriber }>;

  constructor(private appwrite: AppwriteService) { }

  ngOnInit(): void {
    this.appwrite.getDocumentList<BlogSubscriber>(this.appwrite.subscribersCollectionId)
      .subscribe(result => {
        this.subscribers = result;
        this.subscribers = this.appwrite.subscribeForArray(this.subscribers, this.appwrite.subscribersCollectionId);
      });
  }
  ngOnDestroy(): void {
    this.appwrite.unsubscribe();
  }


  public onDelete(subscriberId: string) {
    this.appwrite.deleteDocument(this.appwrite.subscribersCollectionId, subscriberId);
  }

}
