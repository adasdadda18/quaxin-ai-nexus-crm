
import { useState, useEffect } from "react";
import { CheckSquare, MoreHorizontal, Clock, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { generateTaskSuggestions, getApiKey } from "@/services/aiService";

// Mock data
const initialTasks = [
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

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  completed: boolean;
  aiSuggested: boolean;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    const hasApiKey = !!getApiKey();
    setApiKeyConfigured(hasApiKey);
  }, []);

  const handleTaskComplete = (taskId: string, isChecked: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: isChecked } : task
      )
    );

    if (isChecked) {
      toast({
        title: "Nhiệm vụ hoàn thành",
        description: "Nhiệm vụ đã được đánh dấu là hoàn thành",
      });
    }
  };

  const generateAiTasks = async () => {
    if (!apiKeyConfigured) {
      toast({
        title: "API key chưa được cấu hình",
        description: "Vui lòng cấu hình OpenAI API key trong phần Cài đặt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const suggestions = await generateTaskSuggestions();
      
      const newTasks = suggestions.map((suggestion, index) => ({
        id: `ai-task-${Date.now()}-${index}`,
        title: suggestion,
        priority: ["high", "medium", "normal"][Math.floor(Math.random() * 3)],
        dueDate: "Được đề xuất bởi AI",
        completed: false,
        aiSuggested: true,
      }));
      
      setTasks((prevTasks) => [...newTasks, ...prevTasks]);
      
      toast({
        title: "Đề xuất nhiệm vụ mới",
        description: `AI đã tạo ${suggestions.length} đề xuất nhiệm vụ mới`,
      });
    } catch (error) {
      console.error("Error generating AI tasks:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo đề xuất nhiệm vụ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    toast({
      title: "Đã xóa nhiệm vụ",
      description: "Nhiệm vụ đã được xóa thành công",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Nhiệm vụ sắp tới</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateAiTasks}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <Sparkles className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              AI đề xuất
            </Button>
            <Button variant="outline" size="sm">
              <CheckSquare className="h-4 w-4 mr-1" />
              Xem tất cả
            </Button>
          </div>
        </div>
        <CardDescription>Được sắp xếp theo mức độ ưu tiên</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Checkbox 
                id={task.id} 
                className="mt-1" 
                checked={task.completed}
                onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title}
                  </label>
                  {task.aiSuggested && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-quaxin-light/30 text-quaxin-primary border-quaxin-primary/30">
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      AI
                    </span>
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
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          <Button variant="ghost" className="w-full justify-center text-muted-foreground">
            <Plus className="h-4 w-4 mr-1" />
            Thêm nhiệm vụ mới
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
