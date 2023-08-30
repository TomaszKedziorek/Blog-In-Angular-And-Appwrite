import { Injectable } from '@angular/core';
import { Account, Client, Databases, ID, Models, Query, RealtimeResponseEvent, Storage } from 'appwrite';
import { BehaviorSubject, Observable, asyncScheduler, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {

  private readonly client = new Client();
  private readonly account = new Account(this.client);
  private readonly databases = new Databases(this.client);
  private readonly storage = new Storage(this.client);
  public readonly bucketId = environment.appwriteConf.bucketId;
  public readonly databaseId = environment.appwriteConf.databaseId;
  public readonly categoryCollectionId = environment.appwriteConf.categoryCollectionId;
  public readonly postCollectionId = environment.appwriteConf.postCollectionId;
  public readonly subscribersCollectionId = environment.appwriteConf.subscribersCollectionId;
  public readonly commentsCollectionId = environment.appwriteConf.commentsCollectionId;


  constructor(private toastr: ToastrService) {
    this.client
      .setEndpoint(environment.appwriteConf.apiEndpoint)
      .setProject(environment.appwriteConf.projectId);
  }

  public documetDataObject(document: Models.Document) {
    const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...data } = document;
    return data;
  }

  public getDocumentList<T>(collectionId: string, queries?: string[] | undefined) {
    return scheduled(this.databases.listDocuments(this.databaseId, collectionId, queries),
      asyncScheduler
    ).pipe(map(actions => {
      return actions.documents.map(document => {
        const data: T = <T>this.documetDataObject(document);
        const id: string = document.$id;
        return { id, data };
      })
    }))
  }
  public getDocument<T>(collectionId: string, documentId: string, queries?: string[] | undefined) {
    return scheduled(this.databases.getDocument(this.databaseId, collectionId, documentId, queries),
      asyncScheduler
    ).pipe(map(document => {
      const data: T = <T>this.documetDataObject(document);
      return data;
    }))
  }

  public addDocument(collectionId: string, data: Object, documentId: string = ID.unique()) {
    return scheduled(this.databases.createDocument(this.databaseId, collectionId, documentId, data)
      .then(result => {
        this.toastr.success("Insert Successfully!");
      }).catch(error => {
        this.toastr.error("Insert Unuccessfully!");
      }),
      asyncScheduler);
  }

  public updateDocument(collectionId: string, documentId: string, data: Object) {
    return scheduled(this.databases.updateDocument(this.databaseId, collectionId, documentId, data)
      .then(result => {
        this.toastr.success("Update Successfully!");
      }).catch(error => {
        this.toastr.error("Update Unuccessfully!");
      }),
      asyncScheduler);
  }

  public deleteDocument(collectionId: string, documentId: string) {
    return scheduled(this.databases.deleteDocument(this.databaseId, collectionId, documentId)
      .then(result => {
        this.toastr.success("Deleted Successfully!");
      }).catch(error => {
        this.toastr.error("Deleted Unuccessfully!");
      }),
      asyncScheduler);
  }

  public deleteDocumentRange(collectionId: string, documentsIdArray: string[]) {    
    documentsIdArray.forEach(id => {
      this.databases.deleteDocument(this.databaseId, collectionId, id)
        .then(result => {
          this.toastr.success("Deleted Successfully!");
        }).catch(error => {
          this.toastr.error("Deleted Unuccessfully!");
        });
    });
  }
  //=====================FILES=======================================
  public addFile(file: File) {
    const fileId: string = (Math.floor((Math.random() * 1000) + Date.now())).toString(16);
    let fileUrl: string;
    return scheduled(this.storage.createFile(this.bucketId, fileId, file)
      .then(result => {
        this.toastr.success("File Uploaded Successfully!");
        fileUrl = this.storage.getFileView(this.bucketId, fileId).href;
        return { fileId, fileUrl };
      }).catch(error => {
        this.toastr.error("File Uploaded Unuccessfully!");
        return null;
      }),
      asyncScheduler
    )
  }

  public deleteFile(fileId: string) {
    this.storage.deleteFile(this.bucketId, fileId).then(() => {
    }).catch(() => {
    });

  }  //===================QUERIES=====================

  public selectQuery(attribute: string, value: any): string {
    return Query.select([attribute, value]);
  }
  public equalQuery(attribute: string, value: any[]): string {
    return Query.equal(attribute, [...value]);
  }
  public notEqualQuery(attribute: string, value: any[]): string {
    return Query.notEqual(attribute, [...value]);
  }
  public orderDescQuery(attribute: string): string {
    return Query.orderDesc(attribute);
  }
  public orderAscQuery(attribute: string): string {
    return Query.orderAsc(attribute);
  }
  public limitQuery(limit: number): string {
    return Query.limit(limit);
  }
  public isNotNullQuery(attribute: string): string {
    return Query.isNotNull(attribute);
  }
  public isNullQuery(attribute: string): string {
    return Query.isNull(attribute);
  }

  //===================SUBSCRIBE=====================
  // public subscribe<T>(callback: (payload: RealtimeResponseEvent<T>) => void): () => void {
  //   return this.client.subscribe<T>('documents', callback);
  // }
  public unsubscribe = this.client.subscribe(['collections', 'documents', 'files'],
    response => {
      console.log("unsubscribe");
    });

  public subscribeForArray<T>(Data: Array<{ id: string, data: T }>, collectionId: string, type: string = "documents") {
    const eventRoot: string = `databases.${this.databaseId}.collections.${collectionId}`;

    this.client.subscribe<Models.Document>(type, callback => {
      const id: string = callback.payload.$id;
      const data: T = <T>this.documetDataObject(callback.payload);
      const index = Data.findIndex(e => e.id == id, 0);

      if (callback.events.includes(`${eventRoot}.documents.${id}.create`)) {
        const obj = { id, data };
        Data.push(obj);
      }
      if (callback.events.includes(`${eventRoot}.documents.${id}.update`)) {
        if (index > -1) {
          Data[index].data = data;
        }
      }
      if (callback.events.includes(`${eventRoot}.documents.${id}.delete`)) {
        if (index > -1) {
          Data.splice(index, 1);
        }
      }
    });
    return Data;
  }

  //=================LOGIN=========================

  public login(email: string, password: string) {
    return this.account.createEmailSession(email, password);
  }

  public getCurrentSession() {
    return this.account.getSession('current');
  }

  public getAccount() {
    return this.account.get();
  }

  public listLogs() {
    return this.account.listLogs();
  }

  public logOut() {
    return this.account.deleteSession('current');
  }

}
