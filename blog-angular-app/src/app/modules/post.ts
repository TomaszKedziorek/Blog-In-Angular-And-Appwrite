import { Category } from "./category";

export interface Post {
  title: string,
  permalink: string,
  excerpt: string,
  image: string,
  imageId: string,
  category: Category
  content: string;

  isFeatured: boolean,
  views: number,
  status: string,
  createdAt: Date
}
