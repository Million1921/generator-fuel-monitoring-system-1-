import { Droplet } from "lucide-react";
import Link from "next/link";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50/50">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-lime-600 text-white shadow-sm border-b-4 border-lime-700">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Droplet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight uppercase">Gen-Fuel Tech</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-4 pb-24 w-full max-w-md mx-auto relative">
        {children}
      </main>
    </div>
  )
}
