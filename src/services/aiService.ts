// OpenAI service integration
import { toast } from "@/hooks/use-toast";

// This is a placeholder for API key management
// In production, API keys should be stored securely on the server-side
let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
  localStorage.setItem('openai_temp_key', key); // Temporary storage, not secure for production
  return true;
};

export const getApiKey = (): string => {
  if (!apiKey) {
    const storedKey = localStorage.getItem('openai_temp_key');
    if (storedKey) {
      apiKey = storedKey;
    }
  }
  return apiKey;
};

interface AIInsight {
  title: string;
  description: string;
  actionText: string;
}

export const generateInsights = async (contextData?: any): Promise<AIInsight[]> => {
  try {
    const key = getApiKey();
    if (!key) {
      throw new Error("API key is not set");
    }

    const prompt = `
    Bạn là một trợ lý AI trong hệ thống CRM. Hãy tạo ra 3 insights thông minh dựa trên dữ liệu CRM sau:
    - Có 4 nhiệm vụ với mức độ ưu tiên cao cần hoàn thành trong tuần này
    - Khách hàng Công ty ABC đã không liên hệ trong 2 tuần
    - Dự án XYZ có tiến độ chậm 15% so với kế hoạch
    - Nhân viên Nguyễn Văn A đã hoàn thành 90% công việc được giao trong tháng này
    
    Mỗi insight cần bao gồm: tiêu đề ngắn gọn, mô tả chi tiết, và một đề xuất hành động.
    Trả về kết quả ở định dạng JSON với cấu trúc sau:
    [
      {
        "title": "Tiêu đề insight",
        "description": "Mô tả chi tiết",
        "actionText": "Đề xuất hành động"
      }
    ]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý AI chuyên nghiệp trong hệ thống CRM Quaxin AI."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const insightsContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedInsights;
    try {
      parsedInsights = JSON.parse(insightsContent);
    } catch (e) {
      // If parsing fails, try to extract JSON from text
      const jsonMatch = insightsContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedInsights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }
    
    return parsedInsights;
  } catch (error) {
    console.error("Error generating AI insights:", error);
    toast({
      title: "Lỗi khi tạo insights AI",
      description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
      variant: "destructive",
    });
    
    // Return default insights in case of error
    return [
      {
        title: "Tối ưu hóa lịch trình",
        description: "Bạn nên sắp xếp các cuộc họp vào buổi sáng để tăng năng suất làm việc.",
        actionText: "Xem chi tiết",
      },
      {
        title: "Mối quan hệ khách hàng",
        description: "Khách hàng Công ty ABC đã không liên hệ trong 2 tuần, nên chủ động liên lạc.",
        actionText: "Tạo nhiệm vụ",
      },
      {
        title: "Phân tích xu hướng",
        description: "Dự án XYZ có nguy cơ chậm tiến độ 15%, cần phân bổ thêm nguồn lực.",
        actionText: "Xem báo cáo",
      },
    ];
  }
};

export const generateTaskSuggestions = async (): Promise<string[]> => {
  try {
    const key = getApiKey();
    if (!key) {
      throw new Error("API key is not set");
    }

    const prompt = `
    Tạo 3 gợi ý nhiệm vụ thông minh cho người dùng CRM dựa trên dữ liệu sau:
    - Khách hàng lớn: Công ty ABC, Tập đoàn XYZ, Doanh nghiệp DEF
    - Dự án đang thực hiện: Phát triển website, Chiến dịch Marketing Q2, Ứng dụng di động v2.0
    - Thời điểm hiện tại: Đầu quý 2/2025
    
    Trả về kết quả là một mảng các chuỗi, mỗi chuỗi là một gợi ý nhiệm vụ ngắn gọn (không quá 60 ký tự).
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý AI chuyên nghiệp trong hệ thống CRM Quaxin AI."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response to extract the suggestions
    let suggestions: string[] = [];
    
    try {
      // Try to parse as JSON first
      suggestions = JSON.parse(content);
    } catch (e) {
      // If not JSON, split by newlines and clean up
      suggestions = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '').replace(/"/g, '').trim())
        .filter(line => line.length > 0);
    }

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error("Error generating task suggestions:", error);
    // Return default suggestions in case of error
    return [
      "Lên lịch họp đánh giá tiến độ dự án với Tập đoàn XYZ",
      "Chuẩn bị báo cáo quý cho chiến dịch Marketing Q2",
      "Kiểm tra phản hồi của người dùng về ứng dụng di động v1.5"
    ];
  }
};

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  category: string;
  completed: boolean;
  aiSuggested: boolean;
  description?: string;
  assignedTo?: string;
}

interface AnalyzedTask {
  id: string;
  suggestedPriority: 'high' | 'medium' | 'normal' | 'low';
  score: number;
  reason: string;
}

export const analyzeTaskPriorities = async (tasks: Task[]): Promise<AnalyzedTask[]> => {
  try {
    const key = getApiKey();
    if (!key) {
      throw new Error("API key is not set");
    }

    const prompt = `
    Dưới đây là danh sách các nhiệm vụ cần phân tích mức độ ưu tiên:

    ${tasks.map(task => `
    - ID: ${task.id}
    - Tiêu đề: ${task.title}
    - Danh mục: ${task.category}
    - Thời hạn: ${task.dueDate}
    - Ưu tiên hiện tại: ${task.priority}
    ${task.description ? `- Mô tả: ${task.description}` : ''}
    ${task.assignedTo ? `- Người phụ trách: ${task.assignedTo}` : ''}
    `).join('\n')}

    Phân tích mỗi nhiệm vụ và đưa ra mức độ ưu tiên phù hợp nhất dựa trên thông tin có sẵn.
    Trả về kết quả ở định dạng JSON với cấu trúc sau:
    [
      {
        "id": "task-id",
        "suggestedPriority": "high|medium|normal|low",
        "score": [điểm số từ 0-100],
        "reason": "Lý do tại sao nhiệm vụ này có mức độ ưu tiên như vậy"
      }
    ]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý AI chuyên nghiệp trong hệ thống CRM Quaxin AI, chuyên về phân tích và ưu tiên hóa nhiệm vụ."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let result;
    try {
      // Try to parse as JSON first
      result = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error analyzing task priorities:", error);
    toast({
      title: "Lỗi khi phân tích nhiệm vụ",
      description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
      variant: "destructive",
    });
    
    // Return default analyzed tasks in case of error
    return tasks.map(task => ({
      id: task.id,
      suggestedPriority: task.priority as 'high' | 'medium' | 'normal' | 'low',
      score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      reason: "Không thể phân tích tự động, giữ nguyên mức độ ưu tiên hiện tại."
    }));
  }
};

export const getRelatedTasks = async (task: Task): Promise<string[]> => {
  try {
    const key = getApiKey();
    if (!key) {
      throw new Error("API key is not set");
    }

    const prompt = `
    Dựa vào nhiệm vụ sau:
    - Tiêu đề: ${task.title}
    - Danh mục: ${task.category}
    - Mức độ ưu tiên: ${task.priority}
    ${task.description ? `- Mô tả: ${task.description}` : ''}

    Đề xuất 3 nhiệm vụ liên quan mà người dùng nên thực hiện trước hoặc sau nhiệm vụ này.
    Các đề xuất phải cụ thể, hữu ích và liên quan trực tiếp đến nhiệm vụ gốc.
    
    Trả về kết quả là một mảng các chuỗi, mỗi chuỗi là một đề xuất nhiệm vụ ngắn gọn (không quá 60 ký tự).
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý AI chuyên nghiệp trong hệ thống CRM Quaxin AI, chuyên về quản lý nhiệm vụ và quy trình công việc."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response to extract the suggestions
    let suggestions: string[] = [];
    
    try {
      // Try to parse as JSON first
      suggestions = JSON.parse(content);
    } catch (e) {
      // If not JSON, split by newlines and clean up
      suggestions = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '').replace(/"/g, '').trim())
        .filter(line => line.length > 0);
    }

    return suggestions.slice(0, 3);
  } catch (error) {
    console.error("Error generating related tasks:", error);
    // Return default suggestions in case of error
    return [
      `Kiểm tra tiến độ của "${task.title}"`,
      `Lên kế hoạch chi tiết cho "${task.title}"`,
      `Báo cáo kết quả sau khi hoàn thành "${task.title}"`
    ];
  }
};

export const analyzeProjectHealth = async (projectData: any): Promise<{
  score: number;
  recommendations: string[];
}> => {
  try {
    const key = getApiKey();
    if (!key) {
      throw new Error("API key is not set");
    }

    // Simplified prompt for demo purposes
    const prompt = `
    Phân tích sức khỏe của dự án dựa trên dữ liệu sau:
    - Tên dự án: ${projectData.name}
    - Tiến độ: ${projectData.progress}%
    - Số nhiệm vụ hoàn thành: ${projectData.tasks.completed}/${projectData.tasks.total}
    - Ngày đến hạn: ${projectData.dueDate}
    
    Trả về kết quả ở định dạng JSON với cấu trúc sau:
    {
      "score": [điểm số từ 0-100],
      "recommendations": [mảng 2-3 đề xuất hành động]
    }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Bạn là một chuyên gia phân tích dự án AI."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      // If parsing fails, return default data
      throw new Error("Failed to parse AI response");
    }
    
    return {
      score: result.score,
      recommendations: result.recommendations
    };
  } catch (error) {
    console.error("Error analyzing project health:", error);
    // Return default data in case of error
    return {
      score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      recommendations: [
        "Phân bổ thêm nguồn lực để đẩy nhanh tiến độ",
        "Kiểm tra lại các nhiệm vụ còn tồn đọng"
      ]
    };
  }
};
