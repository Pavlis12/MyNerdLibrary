import { Injectable } from '@angular/core';
import { MediaItem } from '../models/media-item.model';

@Injectable({
  providedIn: 'root'
})
export class Storage {
  private readonly STORAGE_KEY = 'media_items';

  async getItems(): Promise<MediaItem[]> {
    return [];
  }

  async saveItem(_item: MediaItem): Promise<void> {}

  async updateItem(_item: MediaItem): Promise<void> {}

  async deleteItem(_id: string): Promise<void> {}
}