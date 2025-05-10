
export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  imageUrl: string;
  description: string;
  category: string;
  isFeatured?: boolean;
  listeners?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin';
  favorites: string[]; // Radio station IDs
}
