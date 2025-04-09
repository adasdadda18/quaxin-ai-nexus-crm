
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const insights = [
  {
    id: "insight-1",
    title: "Tối ưu hóa lịch trình",
    description: "Bạn nên sắp xếp các cuộc họp vào buổi sáng để tăng năng suất làm việc.",
    actionText: "Xem chi tiết",
  },
  {
    id: "insight-2",
    title: "Mối quan hệ khách hàng",
    description: "Khách hàng Công ty ABC đã không liên hệ trong 2 tuần, nên chủ động liên lạc.",
    actionText: "Tạo nhiệm vụ",
  },
  {
    id: "insight-3",
    title: "Phân tích xu hướng",
    description: "Dự án XYZ có nguy cơ chậm tiến độ 15%, cần phân bổ thêm nguồn lực.",
    actionText: "Xem báo cáo",
  },
];

const AIInsights = () => {
  return (
    <Card className="border-quaxin-primary/20 bg-gradient-to-br from-quaxin-light/30 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-quaxin-primary flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-white" />
          </div>
          <CardTitle className="text-lg font-medium">Quaxin AI Insights</CardTitle>
        </div>
        <CardDescription>Phân tích thông minh dựa trên dữ liệu của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-background/80 rounded-md p-3 shadow-sm">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {insight.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                  {insight.actionText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
