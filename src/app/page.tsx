"use client";

import React from "react";
import Countdown from "@/app/components/Countdown";



const HomePage = () => {
  const targetDate = new Date("2025-03-01T00:00:00");

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

      {/* <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-5">
          <h2 className="text-5xl font-bold text-gray-900">Próximos Eventos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mr-2 ml-2">
            {events.map((post) => (
              <EventCard key={post.id} post={post} />
            ))}
          </div>
      </section> */}
    

     
    </div>
  );
};

export default HomePage;