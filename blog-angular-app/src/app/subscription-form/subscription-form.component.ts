import { Component } from '@angular/core';
import { BlogSubscriber } from '../modules/blogSubscriber';
import { AppwriteService } from '../services/appwrite.service';

@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css']
})
export class SubscriptionFormComponent {

  public isEmailInUse: boolean = false;
  public subscribtionSuccess: boolean = false;
  public subscriptionField: boolean = false;

  constructor(private appwrite: AppwriteService) { }

  public onSubmit(formValues: any): void {
    const subscriber: BlogSubscriber = {
      name: formValues.name,
      email: formValues.email
    };
    this.checkSubscribers(subscriber.email).subscribe(result => {
      if (result.length == 0) {
        this.addSubscriber(subscriber);
        formValues.reset
      } else {
        this.isEmailInUse = true;
      }
    });
    this.appwrite.unsubscribe();
  }

  private addSubscriber(data: BlogSubscriber) {
    this.appwrite.addDocument(this.appwrite.subscribersCollectionId, data)
      .then(result => {
        this.subscribtionSuccess = true;
        this.isEmailInUse = false;
        this.subscriptionField = false;
      }).catch(error => {
        this.subscriptionField = true;
      });
  }

  private checkSubscribers(email: string) {
    const query: string[] = [this.appwrite.equalQuery("email", [email])];
    return this.appwrite.getDocumentList<BlogSubscriber>(this.appwrite.subscribersCollectionId, query);
  }
}
