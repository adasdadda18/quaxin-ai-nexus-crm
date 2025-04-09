
import { Search, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

const TopNavbar = () => {
  const isMobile = useIsMobile();

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
        
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-medium">NN</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
