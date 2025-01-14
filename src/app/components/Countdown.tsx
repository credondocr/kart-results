"use client";

import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date; // Fecha objetivo
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex justify-center items-center gap-6 text-lg md:text-3xl font-bold">
      <div className="flex flex-col items-center">
        <span className="bg-gray-900 bg-opacity-80 rounded-lg px-6 py-3">
          {timeLeft.days}
        </span>
        <span className="text-sm md:text-lg mt-2">Días</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-gray-900 bg-opacity-80 rounded-lg px-6 py-3">
          {timeLeft.hours}
        </span>
        <span className="text-sm md:text-lg mt-2">Horas</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-gray-900 bg-opacity-80 rounded-lg px-6 py-3">
          {timeLeft.minutes}
        </span>
        <span className="text-sm md:text-lg mt-2">Minutos</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="bg-gray-900 bg-opacity-80 rounded-lg px-6 py-3">
          {timeLeft.seconds}
        </span>
        <span className="text-sm md:text-lg mt-2">Segundos</span>
      </div>
    </div>
  );
};

export default Countdown;