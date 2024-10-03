import React, { useEffect, useState } from "react";

interface RankingInterface {
  name: string;
  score: number;
}
const Ranking = ({ ranking }: { ranking: RankingInterface[] }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-purple-400">
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-2 px-4 text-center mt-5">
                  No data
                </td>
              </tr>
            ) : (
              ranking?.map((ele, i) => (
                <tr
                  key={i}
                  className="border-b border-purple-400 last:border-b-0"
                >
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4">{ele?.name}</td>
                  <td className="py-2 px-4">{ele?.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
