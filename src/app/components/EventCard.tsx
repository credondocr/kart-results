// src/app/components/PostCard.tsx
"use client";

import React from "react";
import { PostMeta } from "@/types/post";

interface PostCardProps {
  post: PostMeta;
}

const EventCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={post.coverImage || "/default-thumbnail.jpg"}
        alt={post.title}
        className=" w-full object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
        <p className="text-sm text-gray-600">{post.date}</p>
        <a
          href={`/eventos/${post.slug}`}
          className="text-blue-600 hover:text-blue-800 text-sm mt-2 block"
        >
          Leer más
        </a>
      </div>
    </div>
  );
};

export default EventCard;