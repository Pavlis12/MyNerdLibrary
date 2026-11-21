import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MediaItem } from '../models/media-item.model';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);

  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private readonly TMDB_API_KEY = '129698ac1d411c1b63a297c838ef2c8d';

  async searchBooks(query: string): Promise<MediaItem[]> {
    const fields = 'key,title,author_name,cover_i,number_of_pages_median,subject';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=${fields}`;
    const response: any = await firstValueFrom(this.http.get(url));

    return (response.docs || []).map((doc: any) => ({
      id: 'book_' + (doc.key ? doc.key.replace('/works/', '') : Date.now()),
      type: 'book',
      title: doc.title,
      creator: doc.author_name?.[0] || 'Unknown author',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : undefined,
      pages: doc.number_of_pages_median,
      genre: doc.subject?.[0],
      status: 'planned'
    }));
  }

  async searchMoviesAndSeries(query: string): Promise<MediaItem[]> {
    const url = `${this.TMDB_BASE_URL}/search/multi?api_key=${this.TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    const response: any = await firstValueFrom(this.http.get(url));

    return (response.results || [])
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => {
        const isSeries = item.media_type === 'tv';
        const releaseDate = item.release_date || item.first_air_date || '';

        return {
          id: `${isSeries ? 'series' : 'movie'}_${item.id}`,
          type: isSeries ? 'series' : 'movie',
          title: item.title || item.name,
          creator: releaseDate ? releaseDate.slice(0, 4) : 'Unknown year',
          coverUrl: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : undefined,
          status: 'planned'
        } as MediaItem;
      });
  }

  async enrichItemDetails(item: MediaItem): Promise<MediaItem> {
    if (item.type === 'book') {
      return item;
    }

    const rawId = item.id.split('_')[1];
    const endpoint = item.type === 'series' ? 'tv' : 'movie';
    const url = `${this.TMDB_BASE_URL}/${endpoint}/${rawId}?api_key=${this.TMDB_API_KEY}`;

    try {
      const details: any = await firstValueFrom(this.http.get(url));
      const genre = details.genres?.[0]?.name;

      let durationMinutes = 0;
      if (item.type === 'movie') {
        durationMinutes = details.runtime || 0;
      } else {
        const epLength = details.episode_run_time?.[0] || 45;
        const epCount = details.number_of_episodes || 1;
        durationMinutes = epLength * epCount;
      }

      return { ...item, genre, durationMinutes };
    } catch {
      return item;
    }
  }
}