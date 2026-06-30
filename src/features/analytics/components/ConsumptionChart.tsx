"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface ConsumptionData {
  month: string
  liters: number
}

const chartConfig = {
  liters: {
    label: "Liters",
    color: "#65a30d", // lime-600
  },
} satisfies ChartConfig

export function ConsumptionChart({ data }: { data: ConsumptionData[] }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1 pb-6">
        <h3 className="font-semibold text-sm">Fuel Consumption Trend</h3>
        <p className="text-xs text-muted-foreground">Monthly fuel delivery volume (L)</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            tickFormatter={(value) => `${value}L`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="liters"
            fill="url(#colorLiters)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#65a30d" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
