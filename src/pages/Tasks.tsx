
import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { getApiKey, generateTaskSuggestions, analyzeTaskPriorities, getRelatedTasks } from "@/services/aiService";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Brain,
  Link,
  Lightbulb,
  Award,
  PartyPopper,
  Trophy,
  Pencil
} from "lucide-react";

// Task type definition
interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'normal' | 'low';
  dueDate: string;
  category: string;
  completed: boolean;
  aiSuggested: boolean;
  description?: string;
  assignedTo?: string;
  aiScore?: number;
  aiReason?: string;
}

// Form schema for adding/editing tasks
const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự" }),
  priority: z.enum(['high', 'medium', 'normal', 'low']),
  dueDate: z.string(),
  category: z.string(),
  description: z.string().optional(),
  assignedTo: z.string().optional()
});

// Initial mock tasks
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Liên hệ khách hàng tiềm năng",
    priority: "high",
    dueDate: "Hôm nay, 15:00",
    category: "Bán hàng",
    completed: false,
    aiSuggested: true,
    assignedTo: "Nguyễn Văn A"
  },
  {
    id: "task-2",
    title: "Cập nhật tài liệu dự án XYZ",
    priority: "medium",
    dueDate: "Ngày mai, 10:00",
    category: "Tài liệu",
    completed: false,
    aiSuggested: false,
    assignedTo: "Trần Thị B"
  },
  {
    id: "task-3",
    title: "Họp đội nhóm hàng tuần",
    priority: "normal",
    dueDate: "T4, 09:00",
    category: "Nội bộ",
    completed: false,
    aiSuggested: false,
    assignedTo: "Nguyễn Văn A"
  },
  {
    id: "task-4",
    title: "Gửi báo cáo tháng",
    priority: "high",
    dueDate: "T6, 17:00",
    category: "Báo cáo",
    completed: false,
    aiSuggested: true,
    assignedTo: "Trần Thị B"
  },
  {
    id: "task-5",
    title: "Chuẩn bị bài thuyết trình",
    priority: "medium",
    dueDate: "T5, 14:00",
    category: "Bán hàng",
    completed: true,
    aiSuggested: false,
    assignedTo: "Lê Văn C"
  },
  {
    id: "task-6",
    title: "Phân tích dữ liệu bán hàng Q1",
    priority: "high",
    dueDate: "T4, 13:00",
    category: "Phân tích",
    completed: false,
    aiSuggested: true,
    assignedTo: "Lê Văn C"
  },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<{taskId: string, suggestions: string[]}[]>([]);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      priority: "normal",
      dueDate: "",
      category: "",
      description: "",
      assignedTo: ""
    }
  });

  // Check if API key is configured
  useEffect(() => {
    const hasApiKey = !!getApiKey();
    setApiKeyConfigured(hasApiKey);
  }, []);

  // Track completed tasks count for celebration
  useEffect(() => {
    const completed = tasks.filter(task => task.completed).length;
    setCompletedTaskCount(completed);
  }, [tasks]);

  // Reset form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        category: editingTask.category,
        description: editingTask.description || "",
        assignedTo: editingTask.assignedTo || ""
      });
    } else {
      form.reset({
        title: "",
        priority: "normal",
        dueDate: "",
        category: "",
        description: "",
        assignedTo: ""
      });
    }
  }, [editingTask, form]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...tasks];
    
    // Apply tab filter
    if (activeTab === "completed") {
      result = result.filter(task => task.completed);
    } else if (activeTab === "pending") {
      result = result.filter(task => !task.completed);
    } else if (activeTab === "ai") {
      result = result.filter(task => task.aiSuggested);
    }
    
    // Apply search
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter(task => task.category === filterCategory);
    }
    
    // Apply priority filter
    if (filterPriority !== "all") {
      result = result.filter(task => task.priority === filterPriority);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, normal: 1, low: 0 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === "dueDate") {
        // This is simplified - in a real app you would parse the date strings
        comparison = a.dueDate.localeCompare(b.dueDate);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, filterCategory, filterPriority, sortBy, sortOrder, activeTab]);

  // Handle task completion
  const handleTaskComplete = (taskId: string, isChecked: boolean) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: isChecked } : task
      )
    );

    if (isChecked) {
      // Show celebration animation every 3 completed tasks
      const newCompletedCount = completedTaskCount + 1;
      if (newCompletedCount % 3 === 0) {
        setShowCompletionAnimation(true);
        setTimeout(() => setShowCompletionAnimation(false), 3000);
      }
      
      toast({
        title: "Nhiệm vụ hoàn thành",
        description: "Nhiệm vụ đã được đánh dấu là hoàn thành",
      });
    }
  };

  // Handle task selection for batch operations
  const handleSelectTask = (taskId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  // Get available categories from tasks
  const categories = Array.from(new Set(tasks.map(task => task.category)));

  // Generate AI task suggestions
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
        priority: ["high", "medium", "normal"][Math.floor(Math.random() * 3)] as "high" | "medium" | "normal",
        dueDate: "Được đề xuất bởi AI",
        category: categories[Math.floor(Math.random() * categories.length)],
        completed: false,
        aiSuggested: true,
        assignedTo: "",
      }));
      
      setTasks(prevTasks => [...newTasks, ...prevTasks]);
      
      toast({
        title: "Đề xuất nhiệm vụ mới",
        description: `AI đã tạo ${suggestions.length} đề xuất nhiệm vụ mới`,
      });

      // Switch to AI tab to show the new suggestions
      setActiveTab("ai");
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

  // AI analysis of task priorities
  const analyzeTasksWithAI = async () => {
    if (!apiKeyConfigured) {
      toast({
        title: "API key chưa được cấu hình",
        description: "Vui lòng cấu hình OpenAI API key trong phần Cài đặt",
        variant: "destructive",
      });
      return;
    }

    setAiAnalysisLoading(true);
    try {
      // Only analyze incomplete tasks
      const incompleteTasks = tasks.filter(task => !task.completed);
      if (incompleteTasks.length === 0) {
        toast({
          title: "Không có nhiệm vụ cần phân tích",
          description: "Tất cả nhiệm vụ đã hoàn thành hoặc không có nhiệm vụ nào.",
        });
        return;
      }

      const analyzedTasks = await analyzeTaskPriorities(incompleteTasks);
      
      // Update tasks with AI scores and reasons
      setTasks(prevTasks => 
        prevTasks.map(task => {
          const analyzed = analyzedTasks.find(a => a.id === task.id);
          if (analyzed) {
            return { 
              ...task, 
              priority: analyzed.suggestedPriority, 
              aiScore: analyzed.score,
              aiReason: analyzed.reason
            };
          }
          return task;
        })
      );
      
      toast({
        title: "Phân tích nhiệm vụ hoàn tất",
        description: `AI đã phân tích và cập nhật ưu tiên cho ${analyzedTasks.length} nhiệm vụ`,
      });
    } catch (error) {
      console.error("Error analyzing tasks:", error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích nhiệm vụ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Generate related tasks
  const findRelatedTasks = async (taskId: string) => {
    if (!apiKeyConfigured) {
      toast({
        title: "API key chưa được cấu hình",
        description: "Vui lòng cấu hình OpenAI API key trong phần Cài đặt",
        variant: "destructive",
      });
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const suggestions = await getRelatedTasks(task);
      
      setRelatedTasks(prev => {
        // Remove any existing related tasks for this taskId
        const filtered = prev.filter(item => item.taskId !== taskId);
        return [...filtered, { taskId, suggestions }];
      });
      
    } catch (error) {
      console.error("Error getting related tasks:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm nhiệm vụ liên quan. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Add related task as a new task
  const addRelatedTask = (suggestion: string, category: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: suggestion,
      priority: "normal",
      dueDate: "Chưa có thời hạn",
      category: category,
      completed: false,
      aiSuggested: true
    };
    
    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "Đã thêm nhiệm vụ liên quan",
      description: "Nhiệm vụ mới đã được thêm vào danh sách",
    });
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
    toast({
      title: "Đã xóa nhiệm vụ",
      description: "Nhiệm vụ đã được xóa thành công",
    });
  };

  // Batch delete selected tasks
  const handleBatchDelete = () => {
    if (selectedTasks.length === 0) return;
    
    setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.id)));
    toast({
      title: "Xóa nhiệm vụ hàng loạt",
      description: `Đã xóa ${selectedTasks.length} nhiệm vụ thành công`,
    });
    setSelectedTasks([]);
  };

  // Batch complete selected tasks
  const handleBatchComplete = () => {
    if (selectedTasks.length === 0) return;
    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        selectedTasks.includes(task.id) ? { ...task, completed: true } : task
      )
    );
    toast({
      title: "Hoàn thành nhiệm vụ hàng loạt",
      description: `Đã đánh dấu ${selectedTasks.length} nhiệm vụ là hoàn thành`,
    });
    setSelectedTasks([]);
  };

  // Toggle sort order
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Add/Edit task submission
  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...data } 
          : task
      ));
      toast({
        title: "Đã cập nhật nhiệm vụ",
        description: "Nhiệm vụ đã được cập nhật thành công",
      });
    } else {
      // Add new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: data.title,
        priority: data.priority,
        dueDate: data.dueDate || "Chưa có thời hạn",
        category: data.category || "Khác",
        completed: false,
        aiSuggested: false,
        description: data.description,
        assignedTo: data.assignedTo
      };
      
      setTasks(prev => [newTask, ...prev]);
      toast({
        title: "Đã thêm nhiệm vụ mới",
        description: "Nhiệm vụ mới đã được thêm vào danh sách",
      });
    }
    
    setIsAddTaskOpen(false);
    setEditingTask(null);
  };

  // Get stats for the overview cards
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => t.priority === "high" && !t.completed).length,
    dueToday: tasks.filter(t => t.dueDate.includes("Hôm nay") && !t.completed).length
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Quản lý nhiệm vụ</h1>
            <p className="text-muted-foreground mt-1">
              Theo dõi và quản lý tất cả nhiệm vụ trong hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setEditingTask(null);
                  setIsAddTaskOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm nhiệm vụ
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Chỉnh sửa nhiệm vụ" : "Thêm nhiệm vụ mới"}</DialogTitle>
                  <DialogDescription>
                    {editingTask 
                      ? "Cập nhật thông tin cho nhiệm vụ này." 
                      : "Điền thông tin cho nhiệm vụ mới của bạn."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiêu đề nhiệm vụ</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập tiêu đề nhiệm vụ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mức độ ưu tiên</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high">Cao</SelectItem>
                                <SelectItem value="medium">Trung bình</SelectItem>
                                <SelectItem value="normal">Thông thường</SelectItem>
                                <SelectItem value="low">Thấp</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời hạn</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: Hôm nay, 15:00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Danh mục</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Khác">Khác</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Người phụ trách</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: Nguyễn Văn A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Nhập mô tả chi tiết về nhiệm vụ này" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">
                        {editingTask ? "Cập nhật" : "Thêm mới"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={analyzeTasksWithAI}
              disabled={aiAnalysisLoading}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <Brain className={`h-4 w-4 ${aiAnalysisLoading ? 'animate-spin' : ''}`} />
              AI Phân tích
            </Button>
            
            <Button 
              onClick={generateAiTasks}
              disabled={loading}
              className="flex items-center gap-1 bg-quaxin-primary hover:bg-quaxin-primary/80"
            >
              <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              AI đề xuất
            </Button>
          </div>
        </div>

        {/* Completion Animation */}
        {showCompletionAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-background p-8 rounded-lg shadow-xl animate-scale-in flex flex-col items-center max-w-md">
              <div className="mb-4 text-yellow-500 animate-bounce">
                <Trophy className="h-16 w-16" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tuyệt vời!</h2>
              <p className="text-center mb-4">
                Bạn đã hoàn thành {completedTaskCount} nhiệm vụ. Hãy tiếp tục phát huy!
              </p>
              <Button onClick={() => setShowCompletionAnimation(false)}>
                Tiếp tục
              </Button>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng nhiệm vụ</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Ưu tiên cao</p>
                  <p className="text-2xl font-bold">{stats.highPriority}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Hôm nay</p>
                  <p className="text-2xl font-bold">{stats.dueToday}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-medium">Danh sách nhiệm vụ</CardTitle>
              
              <div className="flex flex-wrap items-center gap-2">
                {selectedTasks.length > 0 && (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-sm text-muted-foreground">
                      Đã chọn: {selectedTasks.length}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBatchComplete}
                      className="h-8"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Hoàn thành
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBatchDelete}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Xóa
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-auto min-w-[200px]">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm nhiệm vụ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[130px] h-9">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full sm:w-[130px] h-9">
                      <SelectValue placeholder="Mức ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả mức ưu tiên</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="normal">Thông thường</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-none">Tất cả</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 sm:flex-none">Đang xử lý</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 sm:flex-none">Đã hoàn thành</TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 sm:flex-none flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI đề xuất
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 py-2 px-3 text-sm font-medium text-muted-foreground">
                  <div className="col-span-1">
                    <Checkbox 
                      id="select-all"
                      checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(filteredTasks.map(task => task.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-1 cursor-pointer" onClick={() => handleSort("title")}>
                    Tiêu đề
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="col-span-3 hidden sm:flex items-center gap-1 cursor-pointer" onClick={() => handleSort("category")}>
                    Danh mục
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSort("priority")}>
                    Ưu tiên
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center gap-1 cursor-pointer" onClick={() => handleSort("dueDate")}>
                    Thời hạn
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium">Không có nhiệm vụ</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery ? "Không tìm thấy nhiệm vụ phù hợp với bộ lọc của bạn" : "Chưa có nhiệm vụ nào trong danh mục này"}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={searchQuery ? () => setSearchQuery("") : () => setIsAddTaskOpen(true)}
                    >
                      {searchQuery ? "Xóa bộ lọc" : "Thêm nhiệm vụ mới"}
                    </Button>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div key={task.id}>
                      <div 
                        className={`grid grid-cols-12 gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors ${task.completed ? 'bg-muted/30' : ''}`}
                      >
                        <div className="col-span-1 flex items-center">
                          <Checkbox 
                            id={`select-${task.id}`}
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                            className="mr-2"
                          />
                          <Checkbox 
                            id={task.id}
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
                          />
                        </div>
                        
                        <div className="col-span-5 sm:col-span-4">
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
                            {task.aiScore && (
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200">
                                <Brain className="h-2.5 w-2.5 mr-1" />
                                Điểm: {task.aiScore}
                              </span>
                            )}
                          </div>
                          {task.assignedTo && (
                            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                              {task.assignedTo}
                            </div>
                          )}
                          {task.aiReason && (
                            <div className="text-xs text-muted-foreground mt-1 hidden sm:block italic">
                              "{task.aiReason}"
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-3 hidden sm:block">
                          <Badge variant="outline">
                            {task.category}
                          </Badge>
                        </div>
                        
                        <div className="col-span-3 sm:col-span-2">
                          <Badge className={priorityColors[task.priority]}>
                            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : task.priority === 'normal' ? 'Thông thường' : 'Thấp'}
                          </Badge>
                        </div>
                        
                        <div className="col-span-2 sm:col-span-1 hidden sm:flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{task.dueDate}</span>
                        </div>
                        
                        <div className="col-span-1 flex justify-end items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Thao tác</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingTask(task);
                                setIsAddTaskOpen(true);
                              }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTaskComplete(task.id, !task.completed)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => findRelatedTasks(task.id)}>
                                <Link className="h-4 w-4 mr-2" />
                                Tìm nhiệm vụ liên quan
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Related Tasks Section */}
                      {relatedTasks.find(rt => rt.taskId === task.id) && (
                        <div className="ml-10 pl-4 border-l-2 border-dashed border-muted my-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center">
                            <Lightbulb className="h-3.5 w-3.5 mr-1" />
                            Nhiệm vụ liên quan:
                          </div>
                          <div className="space-y-1">
                            {relatedTasks.find(rt => rt.taskId === task.id)?.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-center justify-between rounded-md p-2 bg-muted/30">
                                <span className="text-sm">{suggestion}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-6"
                                  onClick={() => addRelatedTask(suggestion, task.category)}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  Thêm
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {filteredTasks.length > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {filteredTasks.length} / {tasks.length} nhiệm vụ
                    </div>
                    <Button variant="outline" size="sm">
                      Xem tất cả
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Tasks;
