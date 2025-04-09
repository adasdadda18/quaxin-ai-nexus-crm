
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyConfig from "@/components/settings/ApiKeyConfig";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý cấu hình hệ thống và tùy chọn
          </p>
        </div>

        <Tabs defaultValue="ai">
          <TabsList className="mb-4">
            <TabsTrigger value="ai">Tích hợp AI</TabsTrigger>
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="system">Hệ thống</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai" className="space-y-6">
            <ApiKeyConfig />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
              <div className="text-center">
                <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Tính năng đang được phát triển
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
              <div className="text-center">
                <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Tính năng đang được phát triển
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border border-dashed">
              <div className="text-center">
                <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Tính năng đang được phát triển
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
