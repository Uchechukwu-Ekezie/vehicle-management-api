"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Wrench,
  DollarSign,
  LogOut,
  Menu,
  X,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeTokenCookie, decodeToken } from "@/lib/auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  username?: string;
}

export function Sidebar({ username: usernameProp }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState(usernameProp || "Admin");

  useEffect(() => {
    if (usernameProp) {
      setUsername(usernameProp);
    } else {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && typeof decoded === "object") {
          const name =
            (decoded as Record<string, unknown>).name ||
            (decoded as Record<string, unknown>).unique_name ||
            (decoded as Record<string, unknown>).username ||
            "Admin";
          setUsername(String(name));
        }
      }
    }
  }, [usernameProp]);

  const handleLogout = () => {
    removeTokenCookie();
    router.push("/login");
  };

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Vehicles",
      href: "/admin/vehicles",
      icon: <Car className="h-5 w-5" />,
    },
    {
      title: "Maintenance",
      href: "/admin/maintenance",
      icon: <Wrench className="h-5 w-5" />,
    },
    {
      title: "Inspections",
      href: "/admin/inspections",
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Fleet Tracker
          </h1>
          <p className="text-base text-white/95 mt-1 font-medium">
            Admin Portal
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-6 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Welcome
          </p>
          <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {username}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
                )}
              >
                <span
                  className={cn(
                    "transition-transform duration-200",
                    isActive ? "" : "group-hover:scale-110"
                  )}
                >
                  {item.icon}
                </span>
                <span className="ml-3">{item.title}</span>
                {isActive && (
                  <span className="ml-auto">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Fleet Tracker Admin
          </h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">{sidebarContent}</div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:border-r lg:shadow-xl">
        {sidebarContent}
      </aside>
    </>
  );
}
