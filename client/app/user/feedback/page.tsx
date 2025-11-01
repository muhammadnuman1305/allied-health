"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  User, 
  Calendar,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  ArrowRight,
  Tag
} from "lucide-react";

// Feedback interface
interface Feedback {
  id: string;
  // type: "task" | "patient" | "referral";
  type: string;
  relatedId: string;
  relatedTitle: string;
  content: string;
  author: string;
  date: string;
  // priority: "low" | "medium" | "high";
  priority: string;
  tags: string[];
  isPrivate: boolean;
}

// Mock data
const mockFeedback: Feedback[] = [
  {
    id: "F001",
    type: "task",
    relatedId: "T001",
    relatedTitle: "Blood pressure monitoring - John Smith",
    content: "Patient shows signs of hypertension. BP readings consistently above 140/90. Recommend lifestyle changes including diet and exercise.",
    author: "Dr. Sarah Johnson",
    date: "2024-01-10",
    priority: "high",
    tags: ["hypertension", "lifestyle", "monitoring"],
    isPrivate: false
  },
  {
    id: "F002",
    type: "patient",
    relatedId: "P002",
    relatedTitle: "Maria Garcia - Diabetes Management",
    content: "Glucose levels improving with current medication. Patient is following diet plan well. Continue current treatment protocol.",
    author: "Dr. Michael Chen",
    date: "2024-01-08",
    priority: "medium",
    tags: ["diabetes", "glucose", "medication"],
    isPrivate: false
  },
  {
    id: "F003",
    type: "referral",
    relatedId: "R003",
    relatedTitle: "Robert Wilson - Physical Therapy Referral",
    content: "Patient referred for physical therapy after knee surgery. Initial assessment completed. Rehabilitation plan established with 12-week program.",
    author: "Dr. Emily Davis",
    date: "2023-12-20",
    priority: "medium",
    tags: ["physical therapy", "rehabilitation", "surgery"],
    isPrivate: false
  },
  {
    id: "F004",
    type: "task",
    relatedId: "T004",
    relatedTitle: "Nutrition consultation - Lisa Brown",
    content: "Patient seeking assistance with weight loss. BMI indicates overweight category. Initial consultation scheduled for next week.",
    author: "Dr. David Miller",
    date: "2024-01-11",
    priority: "low",
    tags: ["nutrition", "weight loss", "consultation"],
    isPrivate: false
  },
  {
    id: "F005",
    type: "patient",
    relatedId: "P001",
    relatedTitle: "John Smith - Cardiac Evaluation",
    content: "Patient shows good response to medication. BP readings have improved to normal range. Schedule follow-up in 3 months.",
    author: "Dr. Sarah Johnson",
    date: "2024-01-12",
    priority: "medium",
    tags: ["cardiac", "medication", "follow-up"],
    isPrivate: true
  }
];

const priorityConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" }
};

const typeConfig = {
  task: { label: "Task", color: "bg-blue-100 text-blue-800", icon: FileText },
  patient: { label: "Patient", color: "bg-purple-100 text-purple-800", icon: User },
  referral: { label: "Referral", color: "bg-orange-100 text-orange-800", icon: ArrowRight }
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>(mockFeedback);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.relatedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  // Get feedback counts
  const feedbackCounts = {
    total: feedback.length,
    task: feedback.filter(f => f.type === "task").length,
    patient: feedback.filter(f => f.type === "patient").length,
    referral: feedback.filter(f => f.type === "referral").length,
    private: feedback.filter(f => f.isPrivate).length,
  };

  const handleCreateFeedback = (feedbackData: Partial<Feedback>) => {
    const newFeedback: Feedback = {
      id: `F${Date.now()}`,
      type: feedbackData.type || "task",
      relatedId: feedbackData.relatedId || "",
      relatedTitle: feedbackData.relatedTitle || "",
      content: feedbackData.content || "",
      author: feedbackData.author || "Current User",
      date: new Date().toISOString().split('T')[0],
      priority: feedbackData.priority || "medium",
      tags: feedbackData.tags || [],
      isPrivate: feedbackData.isPrivate || false
    };
    setFeedback([...feedback, newFeedback]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateFeedback = (feedbackId: string, updates: Partial<Feedback>) => {
    setFeedback(feedback.map(item => 
      item.id === feedbackId ? { ...item, ...updates } : item
    ));
    setIsEditDialogOpen(false);
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    setFeedback(feedback.filter(item => item.id !== feedbackId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Notes</h1>
          <p className="text-muted-foreground">Manage feedback and notes for tasks, patients, and referrals</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Feedback</DialogTitle>
            </DialogHeader>
            <CreateFeedbackForm onSubmit={handleCreateFeedback} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Feedback Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Feedback</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackCounts.task}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Feedback</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackCounts.patient}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Feedback</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackCounts.referral}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Private Notes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackCounts.private}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search feedback by content, title, author, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback ({filteredFeedback.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map((item) => {
              const type = typeConfig[item.type as keyof typeof typeConfig];
              const priority = priorityConfig[item.priority as keyof typeof priorityConfig];
              const TypeIcon = type.icon;
              
              return (
                <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={type.color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {type.label}
                      </Badge>
                      <Badge className={priority.color}>
                        {priority.label}
                      </Badge>
                      {item.isPrivate && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-2">{item.relatedTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Feedback Details</DialogTitle>
                        </DialogHeader>
                        {selectedFeedback && <FeedbackDetailView feedback={selectedFeedback} />}
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Feedback</DialogTitle>
                        </DialogHeader>
                        {selectedFeedback && (
                          <EditFeedbackForm 
                            feedback={selectedFeedback} 
                            onSubmit={(updates) => handleUpdateFeedback(selectedFeedback.id, updates)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFeedback(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create Feedback Form Component
function CreateFeedbackForm({ onSubmit }: { onSubmit: (data: Partial<Feedback>) => void }) {
  const [formData, setFormData] = useState({
    type: "task",
    relatedId: "",
    relatedTitle: "",
    content: "",
    priority: "medium",
    tags: [] as string[],
    isPrivate: false
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as "task" | "patient" | "referral" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="relatedId">Related ID</Label>
          <Input
            id="relatedId"
            value={formData.relatedId}
            onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="relatedTitle">Related Title</Label>
          <Input
            id="relatedTitle"
            value={formData.relatedTitle}
            onChange={(e) => setFormData({ ...formData, relatedTitle: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="content">Feedback Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter your feedback or notes..."
          required
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPrivate"
          checked={formData.isPrivate}
          onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isPrivate">Private note (only visible to you)</Label>
      </div>
      
      <Button type="submit" className="w-full">Add Feedback</Button>
    </form>
  );
}

// Edit Feedback Form Component
function EditFeedbackForm({ feedback, onSubmit }: { feedback: Feedback; onSubmit: (updates: Partial<Feedback>) => void }) {
  const [formData, setFormData] = useState({
    type: feedback.type,
    relatedId: feedback.relatedId,
    relatedTitle: feedback.relatedTitle,
    content: feedback.content,
    priority: feedback.priority,
    tags: feedback.tags,
    isPrivate: feedback.isPrivate
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as "task" | "patient" | "referral" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-relatedId">Related ID</Label>
          <Input
            id="edit-relatedId"
            value={formData.relatedId}
            onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-relatedTitle">Related Title</Label>
          <Input
            id="edit-relatedTitle"
            value={formData.relatedTitle}
            onChange={(e) => setFormData({ ...formData, relatedTitle: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-content">Feedback Content</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="edit-tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="edit-tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-isPrivate"
          checked={formData.isPrivate}
          onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="edit-isPrivate">Private note (only visible to you)</Label>
      </div>
      
      <Button type="submit" className="w-full">Update Feedback</Button>
    </form>
  );
}

// Feedback Detail View Component
function FeedbackDetailView({ feedback }: { feedback: Feedback }) {
  const type = typeConfig[feedback.type as keyof typeof typeConfig];
  const priority = priorityConfig[feedback.priority as keyof typeof priorityConfig];
  const TypeIcon = type.icon;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <Badge className={type.color}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {type.label}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <Badge className={priority.color}>
            {priority.label}
          </Badge>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Related Item</Label>
        <p className="text-sm">{feedback.relatedTitle} ({feedback.relatedId})</p>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Content</Label>
        <p className="text-sm whitespace-pre-wrap">{feedback.content}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Author</Label>
          <p className="text-sm">{feedback.author}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Date</Label>
          <p className="text-sm">{feedback.date}</p>
        </div>
      </div>
      
      {feedback.tags.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Tags</Label>
          <div className="flex flex-wrap gap-1 mt-2">
            {feedback.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {feedback.isPrivate && (
        <div>
          <Label className="text-sm font-medium">Visibility</Label>
          <Badge variant="outline" className="text-xs">
            Private Note
          </Badge>
        </div>
      )}
    </div>
  );
}
