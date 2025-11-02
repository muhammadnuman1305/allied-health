"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Filter,
  MessageSquare,
  User,
  Eye,
  FileText,
  ExternalLink,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

// Feedback interface - only for tasks/interventions
interface Feedback {
  id: string;
  taskId: string;
  taskTitle: string;
  interventionId?: string;
  interventionName?: string;
  content: string;
  author: string;
  authorId: string;
  recipientId: string;
  recipientName: string;
  date: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  isPrivate: boolean;
  patientId?: string;
  patientName?: string;
}

// Mock data - filtered to show feedback for current user
const mockFeedback: Feedback[] = [
  {
    id: "F001",
    taskId: "T001",
    taskTitle: "Blood pressure monitoring - John Smith",
    interventionId: "I002",
    interventionName: "Nutrition Consultation",
    content:
      "Patient shows signs of hypertension. BP readings consistently above 140/90. Recommend lifestyle changes including diet and exercise.",
    author: "Dr. Sarah Johnson",
    authorId: "U001",
    recipientId: "CURRENT_USER",
    recipientName: "You",
    date: "2024-01-10",
    priority: "high",
    tags: ["hypertension", "lifestyle", "monitoring"],
    isPrivate: false,
    patientId: "P001",
    patientName: "John Smith",
  },
  {
    id: "F002",
    taskId: "T002",
    taskTitle: "Diabetes Management - Maria Garcia",
    content:
      "Glucose levels improving with current medication. Patient is following diet plan well. Continue current treatment protocol.",
    author: "Dr. Michael Chen",
    authorId: "U002",
    recipientId: "CURRENT_USER",
    recipientName: "You",
    date: "2024-01-08",
    priority: "medium",
    tags: ["diabetes", "glucose", "medication"],
    isPrivate: false,
    patientId: "P002",
    patientName: "Maria Garcia",
  },
  {
    id: "F003",
    taskId: "T003",
    taskTitle: "Physical Therapy Assessment - Robert Wilson",
    content:
      "Patient referred for physical therapy after knee surgery. Initial assessment completed. Rehabilitation plan established with 12-week program.",
    author: "Dr. Emily Davis",
    authorId: "U003",
    recipientId: "CURRENT_USER",
    recipientName: "You",
    date: "2023-12-20",
    priority: "medium",
    tags: ["physical therapy", "rehabilitation", "surgery"],
    isPrivate: false,
    patientId: "P003",
    patientName: "Robert Wilson",
  },
  {
    id: "F004",
    taskId: "T004",
    taskTitle: "Nutrition consultation - Lisa Brown",
    content:
      "Patient seeking assistance with weight loss. BMI indicates overweight category. Initial consultation scheduled for next week.",
    author: "Dr. David Miller",
    authorId: "U004",
    recipientId: "CURRENT_USER",
    recipientName: "You",
    date: "2024-01-11",
    priority: "low",
    tags: ["nutrition", "weight loss", "consultation"],
    isPrivate: false,
    patientId: "P004",
    patientName: "Lisa Brown",
  },
  {
    id: "F005",
    taskId: "T005",
    taskTitle: "Cardiac Evaluation - John Smith",
    content:
      "Patient shows good response to medication. BP readings have improved to normal range. Schedule follow-up in 3 months.",
    author: "Dr. Sarah Johnson",
    authorId: "U001",
    recipientId: "CURRENT_USER",
    recipientName: "You",
    date: "2024-01-12",
    priority: "medium",
    tags: ["cardiac", "medication", "follow-up"],
    isPrivate: true,
    patientId: "P001",
    patientName: "John Smith",
  },
];

const priorityConfig = {
  low: {
    label: "Low",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  medium: {
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  high: {
    label: "High",
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter feedback to show only feedback given to current user
  useEffect(() => {
    if (user) {
      const userFeedback = mockFeedback.filter(
        (f) => f.recipientId === "CURRENT_USER"
      );
      setFeedback(userFeedback);
    }
  }, [user]);

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesPriority =
      priorityFilter === "all" || item.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Get feedback counts
  const feedbackCounts = {
    total: feedback.length,
    highPriority: feedback.filter((f) => f.priority === "high").length,
    mediumPriority: feedback.filter((f) => f.priority === "medium").length,
    lowPriority: feedback.filter((f) => f.priority === "low").length,
  };

  const handleNavigateToTask = (taskId: string) => {
    router.push(`/user/my-tasks`);
  };

  const handleNavigateToPatient = (patientId: string) => {
    if (patientId) {
      router.push(`/user/all-patients/${patientId}`);
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="text-muted-foreground mt-1">
          Task feedback and notes received from colleagues
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Feedback"
          value={feedbackCounts.total}
          icon={MessageSquare}
        />
        <StatsCard
          title="High Priority"
          value={feedbackCounts.highPriority}
          icon={AlertCircle}
          variant="destructive"
        />
        <StatsCard
          title="Medium Priority"
          value={feedbackCounts.mediumPriority}
          icon={MessageSquare}
        />
        <StatsCard
          title="Low Priority"
          value={feedbackCounts.lowPriority}
          icon={MessageSquare}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">No feedback found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFeedback.map((item) => {
            const priority =
              priorityConfig[item.priority as keyof typeof priorityConfig];

            return (
              <Card key={item.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge
                              className={`${priority.color} border`}
                              variant="outline"
                            >
                              {priority.label}
                            </Badge>
                            {item.isPrivate && (
                              <Badge variant="secondary" className="text-xs">
                                Private
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(item.date)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold leading-tight mb-1">
                              {item.taskTitle}
                            </h3>
                            {item.interventionName && (
                              <p className="text-xs text-muted-foreground">
                                Intervention: {item.interventionName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Dialog
                          open={isViewDialogOpen}
                          onOpenChange={setIsViewDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFeedback(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Feedback Details</DialogTitle>
                            </DialogHeader>
                            {selectedFeedback && (
                              <FeedbackDetailView
                                feedback={selectedFeedback}
                                onNavigateToTask={handleNavigateToTask}
                                onNavigateToPatient={handleNavigateToPatient}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {item.content}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            {item.author}
                          </span>
                        </div>
                        {item.patientName && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{item.patientName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{item.taskId}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToTask(item.taskId)}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1.5" />
                          View Task
                          <ArrowRight className="h-3 w-3 ml-1.5" />
                        </Button>
                        {item.patientId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleNavigateToPatient(item.patientId!)
                            }
                            className="text-xs"
                          >
                            <User className="h-3 w-3 mr-1.5" />
                            View Patient
                            <ArrowRight className="h-3 w-3 ml-1.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Feedback Detail View Component
function FeedbackDetailView({
  feedback,
  onNavigateToTask,
  onNavigateToPatient,
}: {
  feedback: Feedback;
  onNavigateToTask: (taskId: string) => void;
  onNavigateToPatient: (patientId: string) => void;
}) {
  const priority =
    priorityConfig[feedback.priority as keyof typeof priorityConfig];

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Badge className={`${priority.color} border`} variant="outline">
            {priority.label}
          </Badge>
          {feedback.isPrivate && (
            <Badge variant="secondary" className="text-xs">
              Private
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(feedback.date)}
        </span>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">
          Task
        </Label>
        <p className="text-base font-semibold">{feedback.taskTitle}</p>
        <p className="text-xs text-muted-foreground">
          Task ID: {feedback.taskId}
        </p>
        {feedback.interventionName && (
          <p className="text-xs text-muted-foreground mt-1">
            Intervention: {feedback.interventionName}
            {feedback.interventionId && ` (${feedback.interventionId})`}
          </p>
        )}
      </div>

      {feedback.patientName && (
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">
            Patient
          </Label>
          <p className="text-base">
            {feedback.patientName}
            {feedback.patientId && (
              <span className="text-sm text-muted-foreground ml-2">
                ({feedback.patientId})
              </span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Feedback
        </Label>
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {feedback.content}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">
          From
        </Label>
        <p className="text-base">{feedback.author}</p>
      </div>

      {feedback.tags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {feedback.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t flex gap-3">
        <Button
          variant="default"
          onClick={() => onNavigateToTask(feedback.taskId)}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Task
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        {feedback.patientId && (
          <Button
            variant="outline"
            onClick={() => onNavigateToPatient(feedback.patientId!)}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            View Patient
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
