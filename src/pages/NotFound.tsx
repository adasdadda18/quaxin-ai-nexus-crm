
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-quaxin-primary mb-4">404</h1>
        <p className="text-2xl font-semibold mb-4">Không tìm thấy trang</p>
        <p className="text-muted-foreground mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến vị trí khác.
        </p>
        <Button asChild className="gap-2">
          <a href="/">
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
