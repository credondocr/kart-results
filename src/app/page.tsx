"use client";

import React, { useEffect, useState } from "react";
import Countdown from "@/app/components/Countdown";
import PostCard from "@/app/components/PostCard";
import { Post } from "@/types/post";
import EventCard from "./components/EventCard";



const HomePage = () => {
  const targetDate = new Date("2025-03-01T00:00:00");
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data: Post[] = await res.json();

        // Ordenar por fecha descendente y tomar los últimos 3
        const recentPosts = data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }).slice(0, 3);

        setPosts(recentPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data: Post[] = await res.json();

        // Ordenar por fecha descendente y tomar los últimos 3
        const recentPosts = data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }).slice(0, 3);

        setEvents(recentPosts);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
    fetchPosts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div
        className="h-screen w-full flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://img1.wsimg.com/isteam/ip/4bd52054-c0f8-473a-8ee9-4b779cde2a7a/3.png/:/cr=t:11.54%25,l:11.54%25,w:76.92%25,h:76.92%25/rs=w:1920,m')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "80vh",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            I FECHA DEL CAMPEONATO <br />
            NACIONAL DE VERANO 2025
          </h1>
          <Countdown targetDate={targetDate} />
        </div>
      </div>

      {/* Recent Posts Section */}

      <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-5">
          <h2 className="text-5xl font-bold text-gray-900">Próximos Eventos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mr-2 ml-2">
            {events.map((post) => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
      </section>
      

      <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-3">
          <h2 className="text-3xl font-bold text-gray-900">Últimos Posts</h2>
          <p className="text-gray-600 mt-2">Explora las últimas novedades sobre kartismo y automovilismo</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mr-2 ml-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
      </section>

     
    </div>
  );
};

export default HomePage;