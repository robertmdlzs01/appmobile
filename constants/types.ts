
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status?: 'draft' | 'published' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}
