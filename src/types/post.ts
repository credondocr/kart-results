export interface Post {
    id: string;
    slug: string;
    title: string;
    date: string;
    content: string;
    tags?: string[];
    category?: string;
    coverImage?: string;
    excerpt: string;
  }
  
  export interface PostMeta {
    id: string;
    slug: string;
    title: string;
    date: string;
    tags?: string[];
    category?: string;
    coverImage?: string;
  }