import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { finalize, take } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AlertController, LoadingController } from '@ionic/angular';



@Component({
  selector: 'app-ads',
  templateUrl: './ads.page.html',
  styleUrls: ['./ads.page.scss'],
})
export class AdsPage {

  path: File | undefined;
  selectedFiles: File[] = [];
  photoUrls: string[] = [];

  constructor(
    private afs: AngularFireStorage,
    private db: AngularFireDatabase,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}
  

  ngOnInit() {
    // const folderPath = 'ads/';

    // this.afs.ref(folderPath).listAll().subscribe(result => {
    //   result.items.forEach(itemRef => {
    //     itemRef.getDownloadURL().then(url => {
    //       this.photoUrls.push(url);
    //     });
    //   });
    // });

    this.db.list('/adsphotos').valueChanges().subscribe((adsphotos: any[]) => {
      this.photoUrls = adsphotos.map(photo => photo.url);
    });
  }

  handleFileInput(event: any) {
    this.selectedFiles = [];
    const files = event.target.files;
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            file['preview'] = reader.result as string;
            this.selectedFiles.push(file);
          };
          reader.readAsDataURL(file);
        } else {
          console.error('Unsupported file type: ' + file.type);
        }
      }
    }
  }
  
  async uploadPhotos() {
    if (this.selectedFiles.length === 0) {
      this.presentAlert('Error', 'No files selected.');
      return;
    }
  
    const totalFiles = this.selectedFiles.length;
    let filesUploaded = 0;
  
    // Create and show a loading indicator
    const loading = await this.loadingController.create({
      message: 'Uploading...',
    });
    await loading.present();
  
    for (const file of this.selectedFiles) {
      const filePath = 'ads/' + new Date().getTime() + file.name;
      const fileRef = this.afs.ref(filePath);
  
      const uniqueIdentifier = new Date().getTime();
  
      const task = this.afs.upload(filePath, file);
      task.snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(downloadURL => {
              filesUploaded++;
  
              this.db.list('/adsphotos').push({ url: downloadURL, id: uniqueIdentifier });
  
              if (filesUploaded === totalFiles) {
                loading.dismiss();
                this.presentAlert('Upload Successful', 'All files uploaded successfully.');
                this.selectedFiles = [];
              }
            });
          })
        )
        .subscribe();
    }
  }
  
  
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  
  async showDeleteConfirm(photo: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this photo?',
      buttons: [
        {
          text: 'No, keep it',
          role: 'cancel',
        },
        {
          text: 'Yes, delete',
          handler: () => {
            this.deletePhoto(photo);
          },
        },
      ],
    });

    await alert.present();
  }

  async deletePhoto(photo: any) {
    const targetURL = photo;

    try {
      const listRef = this.db.list('/adsphotos');
      const dataToDelete$ = listRef.snapshotChanges().pipe(take(1));
      const dataToDelete = await lastValueFrom(dataToDelete$) as any[];
      const photoToDelete = dataToDelete.find((item) => item.payload.val().url === targetURL);

      if (photoToDelete) {
        const itemKey = photoToDelete.payload.key;
        await listRef.remove(itemKey);
      } else {
        console.log('Photo not found in the database.');
        return;
      }
      const filePath = photo;
      const fileRef = this.afs.refFromURL(filePath);
      await fileRef.delete();

      const index = this.photoUrls.indexOf(photoToDelete.url);
      if (index !== -1) {
        this.photoUrls.splice(index, 1);
      }

      console.log('Photo deleted successfully.');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  
  }
  
}
