import { Component, inject , signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonContent,
  IonSpinner,
  IonList,
  IonItem,
  IonThumbnail,
  IonBadge,
  IonButton,
  ToastController,
} from '@ionic/angular';
import { Api } from '../services/api';
import { Storage } from '../services/storage';
import { MediaItem, MediaType } from '../models/media-item.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSearchbar,
    IonContent,
    IonSpinner,
    IonList,
    IonItem,
    IonThumbnail,
    IonBadge,
    IonButton,
  ],
})
export class Tab2Page {
  private api = inject(Api);
  private storage = inject(Storage);
  private toastCtrl = inject(ToastController);

  selectedCategory: 'all' | MediaType = 'all';
  searchQuery = '';
  results = signal<MediaItem[]>([]);
  isLoading = signal(false);
  savedIds = signal(new Set<string>());

  private searchId = 0;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  async ionViewWillEnter() {
    const items = await this.storage.getItems();
    this.savedIds.set(new Set(items.map(i => i.id)));
  }

  onSearch() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.search(), 300);
  }

  private async search() {
    const query = this.searchQuery.trim();
    const id = ++this.searchId;

    if (query.length < 2) {
      this.results.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.results.set([]);

    const cat = this.selectedCategory;
    const tasks: Promise<MediaItem[]>[] = [];

    if (cat !== 'book') {
      tasks.push(
        this.api.searchMoviesAndSeries(query).then(items =>
          cat === 'all' ? items : items.filter(i => i.type === cat)
        )
      );
    }
    if (cat === 'all' || cat === 'book') {
      tasks.push(this.api.searchBooks(query));
    }

    await Promise.allSettled(
      tasks.map(async task => {
        const items = await task;
        if (id === this.searchId) {
          this.results.update(r => [...r, ...items]);
        }
      })
    );

    if (id === this.searchId) {
      this.isLoading.set(false);
    }
  }

  async addItem(item: MediaItem) {
    this.savedIds.update(s => new Set(s).add(item.id));

    const enriched = await this.api.enrichItemDetails(item);
    await this.storage.saveItem(enriched);

    const toast = await this.toastCtrl.create({
      message: `"${item.title}" added to library`,
      duration: 1500,
      color: 'success',
    });
    await toast.present();
  }
}