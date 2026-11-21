export type MediaType = 'book' | 'movie' | 'series';
export type ShelfStatus = 'planned' | 'in_progress' | 'completed';

export interface MediaItem {
  id: string;               
  type: MediaType;
  title: string;
  creator: string;          
  coverUrl?: string;         
  pages?: number;             
  durationMinutes?: number;   
  genre?: string;
  status: ShelfStatus;
  rating?: number;            
  note?: string;
}