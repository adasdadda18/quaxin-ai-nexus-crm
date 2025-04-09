
import { Search, Bell, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const TopNavbar = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = user?.user_metadata?.display_name || user?.email || "User";
  const initials = getInitials(displayName);
  
  return (
    <header className="border-b border-border h-16 px-4 flex items-center justify-between">
      <div className="flex items-center w-full md:w-auto">
        {isMobile && (
          <div className="mr-2 h-8 w-8 rounded-full bg-quaxin-primary flex items-center justify-center text-white font-bold">
            Q
          </div>
        )}
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-10 bg-muted/30"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-quaxin-primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-2">
              <h3 className="font-medium">Thông báo</h3>
              <div className="text-sm text-muted-foreground">
                Bạn không có thông báo mới
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52">
            <div className="space-y-2">
              <h3 className="font-medium">Cài đặt nhanh</h3>
              <div className="text-sm">
                <ul className="space-y-1">
                  <li>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Tài khoản</Button>
                  </li>
                  <li>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Giao diện</Button>
                  </li>
                  <li>
                    <Button variant="ghost" size="sm" className="w-full justify-start">Thông báo</Button>
                  </li>
                </ul>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
