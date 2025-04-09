
import { FolderKanban, CheckCircle, Clock, BarChart, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: "project-1",
    name: "Phát triển website",
    client: "Công ty ABC",
    progress: 75,
    dueDate: "15/05/2025",
    tasks: { completed: 18, total: 24 },
    aiScore: 86,
  },
  {
    id: "project-2",
    name: "Chiến dịch Marketing Q2",
    client: "Tập đoàn XYZ",
    progress: 42,
    dueDate: "30/06/2025",
    tasks: { completed: 12, total: 35 },
    aiScore: 68,
  },
  {
    id: "project-3",
    name: "Ứng dụng di động v2.0",
    client: "Startup DEF",
    progress: 90,
    dueDate: "10/05/2025",
    tasks: { completed: 45, total: 50 },
    aiScore: 92,
  },
];

const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
  return (
    <div className="bg-card rounded-md border border-border p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{project.name}</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
      
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Tiến độ</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" 
          style={{
            background: `hsl(var(--muted))`,
          }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>{project.tasks.completed}/{project.tasks.total}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{project.dueDate}</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs">
          <BarChart className="h-3 w-3 mr-1 text-quaxin-primary" />
          <span className="font-medium text-quaxin-primary">{project.aiScore}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectsOverview = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Dự án đang hoạt động</CardTitle>
          <Button variant="outline" size="sm">
            <FolderKanban className="h-4 w-4 mr-1" />
            Xem tất cả
          </Button>
        </div>
        <CardDescription>Giám sát và quản lý dự án</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsOverview;
