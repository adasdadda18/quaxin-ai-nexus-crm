
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Lightbulb, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  Menu, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
}

const NavItem = ({ icon: Icon, label, path, isActive }: NavItemProps) => (
  <Link
    to={path}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive 
        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { label: "Bảng điều khiển", path: "/", icon: LayoutDashboard },
    { label: "Nhiệm vụ", path: "/tasks", icon: CheckSquare },
    { label: "Liên hệ", path: "/contacts", icon: Users },
    { label: "Kho ý tưởng", path: "/ideas", icon: Lightbulb },
    { label: "Dự án", path: "/projects", icon: FolderKanban },
    { label: "Phân tích", path: "/analytics", icon: BarChart3 },
    { label: "Cài đặt", path: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-quaxin-primary flex items-center justify-center text-white font-bold">
              Q
            </div>
            <span className="font-bold text-lg">Quaxin AI</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>

      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <p className="font-medium text-foreground">Người dùng</p>
              <p className="text-xs">Quaxin AI CRM</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
