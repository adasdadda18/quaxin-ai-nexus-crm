
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import TaskList from "@/components/dashboard/TaskList";
import ContactsOverview from "@/components/dashboard/ContactsOverview";
import AIInsights from "@/components/dashboard/AIInsights";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import { CheckSquare, Users, Lightbulb, FolderKanban, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng trở lại, hôm nay là ngày 9 tháng 4, 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 dashboard-section">
          <StatCard 
            title="Tổng nhiệm vụ" 
            value={42} 
            description="13 nhiệm vụ đến hạn hôm nay"
            trend={{ value: 8, isPositive: true }}
            icon={<CheckSquare className="h-4 w-4" />}
          />
          <StatCard 
            title="Liên hệ hoạt động" 
            value={128} 
            description="24 liên hệ mới trong tháng này"
            trend={{ value: 12, isPositive: true }}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard 
            title="Ý tưởng được ghi lại" 
            value={56} 
            description="8 ý tưởng mới trong tuần này"
            trend={{ value: 5, isPositive: true }}
            icon={<Lightbulb className="h-4 w-4" />}
          />
          <StatCard 
            title="Dự án hoạt động" 
            value={12} 
            description="85% dự án đang đúng tiến độ"
            trend={{ value: 3, isPositive: false }}
            icon={<FolderKanban className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-section">
          <div className="lg:col-span-1">
            <TaskList />
          </div>
          <div className="lg:col-span-1">
            <ContactsOverview />
          </div>
          <div className="lg:col-span-1">
            <AIInsights />
          </div>
        </div>

        <div className="dashboard-section">
          <ProjectsOverview />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
