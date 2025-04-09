
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { setApiKey, getApiKey } from "@/services/aiService";

const ApiKeyConfig = () => {
  const [apiKey, setApiKeyState] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKeyState(storedKey);
      setIsConfigured(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng nhập API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = setApiKey(apiKey);
      if (success) {
        setIsConfigured(true);
        toast({
          title: "Thành công",
          description: "Đã lưu API key thành công",
        });
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu API key",
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Cấu hình API Key</CardTitle>
        <CardDescription>
          Kết nối với OpenAI API để kích hoạt các tính năng AI nâng cao
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">OpenAI API Key</label>
              {isConfigured && (
                <span className="flex items-center text-xs text-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã cấu hình
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                type={isVisible ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={toggleVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Lock className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSaveKey}>
              {isConfigured ? "Cập nhật API Key" : "Lưu API Key"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 flex items-start">
              <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Lưu ý: Đây chỉ là phương pháp lưu trữ tạm thời cho mục đích demo. 
                Trong môi trường sản phẩm thực tế, API key nên được lưu trữ an toàn trên máy chủ.
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyConfig;
