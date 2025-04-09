
import { useState, useEffect } from "react";
import { FolderKanban, CheckCircle, Clock, BarChart, MoreHorizontal, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyzeProjectHealth, getApiKey } from "@/services/aiService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const initialProjects = [
  {
    id: "project-1",
    name: "Phát triển website",
    client: "Công ty ABC",
    progress: 75,
    dueDate: "15/05/2025",
    tasks: { completed: 18, total: 24 },
    aiScore: 86,
    recommendations: [] as string[],
  },
  {
    id: "project-2",
    name: "Chiến dịch Marketing Q2",
    client: "Tập đoàn XYZ",
    progress: 42,
    dueDate: "30/06/2025",
    tasks: { completed: 12, total: 35 },
    aiScore: 68,
    recommendations: [] as string[],
  },
  {
    id: "project-3",
    name: "Ứng dụng di động v2.0",
    client: "Startup DEF",
    progress: 90,
    dueDate: "10/05/2025",
    tasks: { completed: 45, total: 50 },
    aiScore: 92,
    recommendations: [] as string[],
  },
];

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  dueDate: string;
  tasks: { completed: number; total: number };
  aiScore: number;
  recommendations: string[];
}

const ProjectCard = ({ project, onAnalyze }: { project: Project; onAnalyze: (projectId: string) => void }) => {
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
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-1.5 hover:bg-muted" 
                onClick={() => onAnalyze(project.id)}
              >
                <div className="flex items-center text-xs">
                  <BarChart className="h-3 w-3 mr-1 text-quaxin-primary" />
                  <span className="font-medium text-quaxin-primary">{project.aiScore}</span>
                  <Sparkles className="h-2.5 w-2.5 ml-1 text-quaxin-primary" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="w-64">
                <p className="font-medium mb-1">Phân tích sức khỏe dự án</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Điểm số: {project.aiScore}/100
                </p>
                {project.recommendations.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Đề xuất:</p>
                    <ul className="text-xs space-y-1">
                      {project.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs">Nhấp để phân tích dự án</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

const ProjectsOverview = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [analyzeInProgress, setAnalyzeInProgress] = useState<string | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    const hasApiKey = !!getApiKey();
    setApiKeyConfigured(hasApiKey);
  }, []);

  const handleAnalyzeProject = async (projectId: string) => {
    if (!apiKeyConfigured) {
      return;
    }

    setAnalyzeInProgress(projectId);
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const analysis = await analyzeProjectHealth(project);
      
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, aiScore: analysis.score, recommendations: analysis.recommendations }
            : p
        )
      );
    } catch (error) {
      console.error("Error analyzing project:", error);
    } finally {
      setAnalyzeInProgress(null);
    }
  };

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
            <ProjectCard 
              key={project.id} 
              project={project} 
              onAnalyze={handleAnalyzeProject}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsOverview;
