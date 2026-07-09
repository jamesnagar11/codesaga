'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { useUser } from '@/lib/store';

interface ActivityData {
  date: string;
  totalSubmissions: number;
  acceptedSubmissions: number;
}

export default function SubmissionsGraph() {
  const [hoveredData, setHoveredData] = useState<ActivityData | null>(null);
  const user = useUser((state) => state.user);
  const monthlyActivity = useUser((state) => state.monthlyActivity);
  const setMonthlyActivity = useUser((state) => state.setMonthlyActivity);
  const [isLoading, setIsLoading] = useState(!monthlyActivity);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      if (monthlyActivity) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/activity/monthly/${user.id}`);
        const result = await response.json();          
        if (result?.dailyActivity) {
          setMonthlyActivity(result);
        } else {
          // If the backend doesn't return dailyActivity, we can set an empty default
          setMonthlyActivity({ dailyActivity: [] });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, monthlyActivity, setMonthlyActivity]);

  const todayData = monthlyActivity?.dailyActivity && monthlyActivity.dailyActivity.length > 0
    ? monthlyActivity.dailyActivity[monthlyActivity.dailyActivity.length - 1] 
    : null;
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="p-4 rounded-lg shadow-lg text-[#bdbfc2] bg-[#282828] w-full lg:w-1/2 flex flex-col justify-between">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#303030] rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-[#303030] rounded w-1/2 mx-auto"></div>
          <div className="h-48 bg-[#303030] rounded"></div>
        </div>
      ) : monthlyActivity?.dailyActivity && monthlyActivity.dailyActivity.length > 0 ? (
        <>
          <div className="text-center mb-2">
            <p className="text-lg font-bold">
              {hoveredData
                ? `${dayjs(hoveredData.date).format('MMM DD')}, ${year}`
                : `${monthName} ${currentDate.getDate()}, ${year}`}
            </p>
            <p>Total Submissions: {hoveredData ? hoveredData.totalSubmissions : todayData?.totalSubmissions ?? 0}</p>
            <p>Accepted Submissions: {hoveredData ? hoveredData.acceptedSubmissions : todayData?.acceptedSubmissions ?? 0}</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={monthlyActivity.dailyActivity}
              onMouseMove={(e) => setHoveredData(e.activePayload?.[0]?.payload || null)}
              onMouseLeave={() => setHoveredData(null)}
            >
              <XAxis dataKey="date" tickFormatter={(tick) => dayjs(tick).format('MMM DD')} stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="totalSubmissions" stroke="#8884d8" fill="#8884d8" opacity={0.6} />
              <Area type="monotone" dataKey="acceptedSubmissions" stroke="#82ca9d" fill="#82ca9d" opacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400">
           <div className="text-center mb-2 w-full">
            <p className="text-lg font-bold">
              {`${monthName} ${currentDate.getDate()}, ${year}`}
            </p>
            <p>Total Submissions: 0</p>
            <p>Accepted Submissions: 0</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border-t border-[#303030] w-full pt-6 mt-2">
            <svg className="w-12 h-12 mb-3 text-gray-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <p className="text-md font-medium text-gray-300">No submission data</p>
            <p className="text-sm mt-1">Start solving problems to see your activity graph!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ActivityData }[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 rounded-lg text-white shadow-md">
        <p className="font-bold">{dayjs(payload[0].payload.date).format('MMM DD')}</p>
        {<p>Total Submissions: {payload[0].payload.totalSubmissions}</p>}
        <p>Accepted Submissions: {payload[0].payload.acceptedSubmissions}</p>
      </div>
    );
  }
}
