
import { CheckSquare, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data
const tasks = [
  {
    id: "task-1",
    title: "Liên hệ khách hàng tiềm năng",
    priority: "high",
    dueDate: "Hôm nay, 15:00",
    completed: false,
    aiSuggested: true,
  },
  {
    id: "task-2",
    title: "Cập nhật tài liệu dự án XYZ",
    priority: "medium",
    dueDate: "Ngày mai, 10:00",
    completed: false,
    aiSuggested: false,
  },
  {
    id: "task-3",
    title: "Họp đội nhóm hàng tuần",
    priority: "normal",
    dueDate: "T4, 09:00",
    completed: false,
    aiSuggested: false,
  },
  {
    id: "task-4",
    title: "Gửi báo cáo tháng",
    priority: "high",
    dueDate: "T6, 17:00",
    completed: false,
    aiSuggested: true,
  },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const TaskList = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Nhiệm vụ sắp tới</CardTitle>
          <Button variant="outline" size="sm">
            <CheckSquare className="h-4 w-4 mr-1" />
            Xem tất cả
          </Button>
        </div>
        <CardDescription>Được sắp xếp theo mức độ ưu tiên</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Checkbox id={task.id} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <label
                    htmlFor={task.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {task.title}
                  </label>
                  {task.aiSuggested && (
                    <span className="ai-badge">AI</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thông thường'}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.dueDate}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Thao tác</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                  <DropdownMenuItem>Đặt lại thời hạn</DropdownMenuItem>
                  <DropdownMenuItem>Chỉ định cho người khác</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
