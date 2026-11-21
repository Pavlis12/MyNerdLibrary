import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { MediaItem } from '../models/media-item.model';

//perzistentní ukládání
@Injectable({
  providedIn: 'root'
})
export class Storage {
  private readonly STORAGE_KEY = 'media_items';

  async getItems(): Promise<MediaItem[]> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  async saveItem(item: MediaItem): Promise<void> {
    const items = await this.getItems();
    const exists = items.some(i => i.id === item.id);
    if (!exists) {
      items.push(item);
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(items)
      });
    }
  }

  async updateItem(updatedItem: MediaItem): Promise<void> {
    const items = await this.getItems();
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index !== -1) {
      items[index] = updatedItem;
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(items)
      });
    }
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.getItems();
    const filtered = items.filter(i => i.id !== id);
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(filtered)
    });
  }
}