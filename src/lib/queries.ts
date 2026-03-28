import { groq } from "next-sanity";

export const allBooksQuery = groq`*[_type == "book"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  price,
  rating,
  "authorName": author->name,
  "categories": categories[]->title,
  "formats": formats, // sau ce nume ai dat câmpului de tip (paperback, ebook etc)
  "imageUrl": image.asset->url,
  shortDescription
}`;