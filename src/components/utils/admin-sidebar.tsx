import { Button } from "@/components/ui/button";
import { BarChart3, Users, UserCheck, Vote, FileText, Settings, AlertTriangle } from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, isSidebarOpen, toggleSidebar }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "System overview",
    },
    {
      id: "voters",
      label: "Voter Management",
      icon: Users,
      description: "Manage voter accounts",
    },
    {
      id: "admins",
      label: "Admin Management",
      icon: UserCheck,
      description: "Manage administrators",
    },
    {
      id: "elections",
      label: "Election Management",
      icon: Vote,
      description: "Manage elections & polls",
    },
    {
      id: "audit",
      label: "Audit Logs",
      icon: FileText,
      description: "System activity logs",
      alert: true,
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      description: "Platform configuration",
    },
  ];

  return (
    <aside
      className={`fixed left-0 z-50 w-64 bg-white border-r p-4 transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-64 lg:w-72 top-16 min-h-[calc(100vh-4rem)] md:min-h-screen`}
    >
      <nav className="space-y-2 mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 text-left ${isActive ? "bg-primary hover:bg-primary/90" : "hover:bg-gray-100"
                }`}
              onClick={() => {
                onTabChange(item.id);
                toggleSidebar(); // Close sidebar on mobile after selection
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium text-sm md:text-base">{item.label}</div>
                    <div className="text-xs text-gray-700 hidden md:block">{item.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {item.alert && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
              </div>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}