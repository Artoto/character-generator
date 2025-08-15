"use client";
import React, { useState } from "react";
import { Sparkle, SquareTerminal, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const AnimatedMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      icon: SquareTerminal,
      label: "Prompt",
      color: "bg-blue-500 hover:bg-blue-600",
      path: "/prompt",
    },
    {
      icon: Sparkle,
      label: "หน้าแรก",
      color: "bg-[#ffcc00] hover:bg-[#ffdb33]",
      path: "/",
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed ${
        isOpen ? " bottom-[60px] right-[60px]" : " bottom-0 right-0"
      }  p-4 z-40 transition-[bottom,right] duration-300 ease-in-out`}
    >
      <div className="relative">
        {/* Main toggle button */}
        <button
          onClick={toggleMenu}
          className={`relative z-10 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ease-in-out transform ${
            isOpen ? "rotate-180 scale-110" : "hover:scale-105"
          }`}
        >
          <div className="flex items-center justify-center cursor-pointer">
            {isOpen ? (
              <X size={24} className="transition-all duration-200" />
            ) : (
              <Menu size={24} className="transition-all duration-200" />
            )}
          </div>
        </button>

        {/* Menu items */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const angle = index * 90 - 135; // Spread items in a quarter circle
            const radius = 100;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <div
                key={item.label}
                className={`absolute transition-all duration-500 ease-out ${
                  isOpen
                    ? "translate-x-0 translate-y-0 opacity-100"
                    : "translate-x-0 translate-y-0 opacity-0"
                }`}
                style={{
                  transform: isOpen
                    ? `translate(${x}px, ${y}px)`
                    : "translate(0px, 0px)",
                  transitionDelay: isOpen ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="relative group">
                  <button
                    onClick={() => handleMenuClick(item.path)}
                    className={`w-12 h-12 rounded-full ${item.color} text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer`}
                  >
                    <Icon size={20} className="mx-auto" />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedMenu;
