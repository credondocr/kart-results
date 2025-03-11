'use client';

import React from 'react';
import { Leaderboard } from '@/data/types';
import { CategoryResults } from '@/components/tables/CategoryResults';

interface LeaderboardTableProps {
  leaderboard: Leaderboard;
}

const GeneralTable: React.FC<LeaderboardTableProps> = ({ leaderboard }) => {
  return (
    <div className="flex justify-center items-center px-1 py-1">
      <div className="w-full max-w-6xl">
        {leaderboard.classes.map((cls, clsIndex) => (
          <div key={clsIndex} className="my-5 p-2">
            <h2 className="text-2xl font-bold text-center mb-4">
              {cls.title}
            </h2>
            {cls.categories.map((category, catIndex) => (
              <CategoryResults
                key={catIndex}
                name={category.name}
                results={category.results}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneralTable;