"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface ChartData {
  name?: string;
  day?: string;
  value?: number;
  tasks?: number;
  completed?: number;
  [key: string]: any;
}

interface AdminChartProps {
  data: ChartData[];
  type: "priority" | "status" | "weekly";
  priorityColors?: Record<string, string>;
}

export function AdminChart({ data, type, priorityColors }: AdminChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Loading chart...
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        width: "100%",
        height: "300px",
        minHeight: "300px",
        display: "block",
        position: "relative",
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          {type === "weekly" ? (
            <>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" name="Total Tasks" fill="#10b981" />
              <Bar dataKey="completed" name="Completed" fill="#3b82f6" />
            </>
          ) : type === "priority" && priorityColors ? (
            <>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={priorityColors[entry.name as string] || "#3b82f6"}
                  />
                ))}
              </Bar>
            </>
          ) : (
            <>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
