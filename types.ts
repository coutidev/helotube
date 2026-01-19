
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  postedAt: string;
  duration: string;
  videoUrl?: string;
  description: string;
  isVertical?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: string;
  time: string;
}
