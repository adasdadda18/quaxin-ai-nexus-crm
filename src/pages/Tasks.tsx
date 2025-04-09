
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
import { toast } from "@/hooks/use-toast";
import { getApiKey, generateTaskSuggestions } from "@/services/aiService";
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
  ArrowRight
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
}

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

  // Check if API key is configured
  useEffect(() => {
    const hasApiKey = !!getApiKey();
    setApiKeyConfigured(hasApiKey);
  }, []);

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

  // Add new task
  const handleAddTask = () => {
    // In a real application, you would open a form or modal to add a new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "Nhiệm vụ mới",
      priority: "normal",
      dueDate: "Chưa có thời hạn",
      category: "Khác",
      completed: false,
      aiSuggested: false
    };
    
    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "Đã thêm nhiệm vụ mới",
      description: "Hãy chỉnh sửa chi tiết cho nhiệm vụ mới của bạn",
    });
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
            <Button variant="outline" onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm nhiệm vụ
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
                      onClick={searchQuery ? () => setSearchQuery("") : handleAddTask}
                    >
                      {searchQuery ? "Xóa bộ lọc" : "Thêm nhiệm vụ mới"}
                    </Button>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
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
                        </div>
                        {task.assignedTo && (
                          <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                            {task.assignedTo}
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
                          {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thông thường'}
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
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Đánh dấu hoàn thành
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Đặt lại thời hạn
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
