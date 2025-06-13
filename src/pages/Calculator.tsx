
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LienCalculator from "@/components/calculator/LienCalculator";

const Calculator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="pt-16 md:pl-64">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Lien Reduction Calculator</h1>
            <p className="text-muted-foreground mt-1">
              Calculate potential lien reductions for personal injury cases
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <LienCalculator />
          </div>
        </div>
      </main>
      
      <footer className="md:pl-64 px-4 py-6 border-t text-sm text-muted-foreground">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">LYZ Law Firm</span> | Calculator
          </div>
          <div className="text-sm">© 2023 LYZ Law Firm. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Calculator;
