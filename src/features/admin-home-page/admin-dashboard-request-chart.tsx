"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

type AdminDashboardRequestChartProps = {
  data: { date: string; requests: number }[];
};

export const AdminDashboardRequestChart = ({
  data,
}: AdminDashboardRequestChartProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;
  return (
    <BarChart
      width={730}
      height={250}
      data={data}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <XAxis dataKey="date" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Bar dataKey="requests" fill="#82ca9d" />
    </BarChart>
  );
};
