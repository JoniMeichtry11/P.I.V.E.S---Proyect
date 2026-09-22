import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Uploads an image to Firebase Storage and returns the public download URL.
   * @param path The path in Storage (e.g. 'landing/hero_image_123.jpg')
   * @param file The File object from an input element
   * @returns Promise<string> with the download URL
   */
  async uploadImage(path: string, file: File): Promise<string> {
    const storage = await this.firebaseService.getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}

