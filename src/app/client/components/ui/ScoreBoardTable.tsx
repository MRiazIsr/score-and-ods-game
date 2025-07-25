"use client";

import { ScoreBoardData } from "@/app/server/modules/competitions/types";

interface ScoreBoardTableProps {
  data: ScoreBoardData;
  currentUserId?: string;
}

export function ScoreBoardTable({ data, currentUserId }: ScoreBoardTableProps) {
  const hasEntries = data.entries && data.entries.length > 0;

  return (
    <div className="w-full rounded-lg border border-gray-700">
      <table className="w-full table-fixed divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Exact Score
              <span className="block text-gray-500 text-[10px] normal-case font-normal">3 points</span>
            </th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Difference
              <span className="block text-gray-500 text-[10px] normal-case font-normal">2 points</span>
            </th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Outcome
              <span className="block text-gray-500 text-[10px] normal-case font-normal">1 point</span>
            </th>
            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total Points
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {hasEntries ? (
            data.entries.map((entry, index) => (
              <tr 
                key={entry.userId}
                className={`${entry.userId === currentUserId ? 'bg-blue-900 bg-opacity-30' : ''} hover:bg-gray-800 transition-colors`}
              >
                <td className="px-4 py-4 text-sm font-medium text-white truncate">
                  {index + 1}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 truncate">
                  {entry.userName} {entry.userId === currentUserId && '(You)'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 truncate">
                  {entry.predictedCount}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 truncate">
                  {entry.predictedDifference}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300 truncate">
                  {entry.predictedOutcome}
                </td>
                <td className="px-4 py-4 text-sm text-green-400 font-semibold truncate">
                  {entry.points}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <svg className="h-12 w-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg font-medium">No Leaderboard Data Available</p>
                  <p className="text-gray-500 max-w-md">
                    There are no completed matches with predictions yet. When matches finish and users make predictions, the leaderboard will be populated.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
