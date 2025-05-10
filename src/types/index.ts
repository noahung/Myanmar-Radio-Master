
export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  imageUrl?: string;
  description?: string;
  category: string;
  isFeatured?: boolean;
  listeners?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  favorites?: string[];
  country?: string;
}

export interface StationComment {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}
