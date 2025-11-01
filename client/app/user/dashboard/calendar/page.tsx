"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Event interface
interface CalendarEvent {
  id: string;
  title: string;
  type: "appointment" | "task" | "referral" | "meeting";
  date: string;
  time: string;
  duration: number; // in minutes
  patientId?: string;
  patientName?: string;
  description: string;
  status: "scheduled" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
}

// Mock data
const initialMockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Patient Consultation - John Smith",
    type: "appointment",
    date: "2024-01-15",
    time: "09:00",
    duration: 30,
    patientId: "P001",
    patientName: "John Smith",
    description: "Follow-up consultation for hypertension management",
    status: "scheduled",
    priority: "high"
  },
  {
    id: "2",
    title: "Task Review - Blood Pressure Monitoring",
    type: "task",
    date: "2024-01-15",
    time: "11:00",
    duration: 15,
    description: "Review blood pressure readings for assigned patients",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: "3",
    title: "Referral Meeting - Cardiology",
    type: "referral",
    date: "2024-01-15",
    time: "14:00",
    duration: 45,
    description: "Discuss patient referral to cardiology department",
    status: "scheduled",
    priority: "high"
  },
  {
    id: "4",
    title: "Patient Consultation - Maria Garcia",
    type: "appointment",
    date: "2024-01-16",
    time: "10:30",
    duration: 45,
    patientId: "P002",
    patientName: "Maria Garcia",
    description: "Diabetes management consultation",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: "5",
    title: "Team Meeting",
    type: "meeting",
    date: "2024-01-16",
    time: "15:00",
    duration: 60,
    description: "Weekly team meeting to discuss patient cases",
    status: "scheduled",
    priority: "low"
  }
];

const typeConfig = {
  appointment: { label: "Appointment", color: "bg-blue-100 text-blue-800", icon: User },
  task: { label: "Task", color: "bg-green-100 text-green-800", icon: FileText },
  referral: { label: "Referral", color: "bg-orange-100 text-orange-800", icon: ArrowRight },
  meeting: { label: "Meeting", color: "bg-purple-100 text-purple-800", icon: CalendarIcon }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [eventToReschedule, setEventToReschedule] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [events, setEvents] = useState<CalendarEvent[]>(initialMockEvents);

  // Get date range for calendar display
  const getDateRange = () => {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setCurrentDate(today);
  };

  // Add new event
  const addEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: Date.now().toString(), // Generate unique ID
      status: "scheduled"
    };
    setEvents(prevEvents => [...prevEvents, event]);
  };

  // Update existing event
  const updateEvent = (eventId: string, updatedEvent: Partial<CalendarEvent>) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, ...updatedEvent }
          : event
      )
    );
  };

  // Delete event
  const deleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    setEventToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Handle edit button click
  const handleEditClick = (event: CalendarEvent) => {
    setEventToEdit(event);
    setIsEditDialogOpen(true);
    setSelectedEvent(null);
  };

  // Handle reschedule button click
  const handleRescheduleClick = (event: CalendarEvent) => {
    setEventToReschedule(event);
    setIsRescheduleDialogOpen(true);
    setSelectedEvent(null);
  };

  // Handle delete button click
  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
    setSelectedEvent(null);
  };

  const dateRange = getDateRange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your healthcare appointments, tasks, and events</p>
        </div>
        <div className="flex gap-2">
          <Select value={viewType} onValueChange={(value) => setViewType(value as "week" | "month")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <CreateEventForm 
                onSubmit={(newEvent) => {
                  addEvent(newEvent);
                  setIsCreateDialogOpen(false);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="start-date" className="text-sm font-medium">Start Date:</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newStartDate = new Date(e.target.value);
                    setStartDate(newStartDate);
                    // If end date is before start date, update end date
                    if (endDate < newStartDate) {
                      setEndDate(newStartDate);
                    }
                  }}
                  className="w-40"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date" className="text-sm font-medium">End Date:</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newEndDate = new Date(e.target.value);
                    setEndDate(newEndDate);
                  }}
                  min={startDate.toISOString().split('T')[0]}
                  className="w-40"
                />
              </div>
              
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            
            <div className="text-lg font-semibold">
              {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid border-b" style={{ gridTemplateColumns: `80px repeat(${dateRange.length}, 1fr)` }}>
            <div className="p-3 border-r bg-muted/50"></div>
            {dateRange.map((date, index) => (
              <div key={index} className="p-3 border-r text-center min-w-[120px]">
                <div className="text-sm font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${date.toDateString() === new Date().toDateString() ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time slots */}
          {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
            <div key={hour} className="grid border-b" style={{ gridTemplateColumns: `80px repeat(${dateRange.length}, 1fr)` }}>
              <div className="p-2 border-r bg-muted/50 text-sm text-muted-foreground">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
              {dateRange.map((date, dayIndex) => {
                const events = getEventsForDate(date).filter(event => {
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hour;
                });
                
                return (
                  <div key={dayIndex} className="p-1 border-r min-h-[60px] min-w-[120px]">
                    {events.map((event) => {
                      const type = typeConfig[event.type];
                      const priority = priorityConfig[event.priority];
                      
                      return (
                        <div
                          key={event.id}
                          className="mb-1 p-1 text-xs rounded cursor-pointer hover:bg-muted"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="flex items-center gap-1">
                            <Badge className={type.color} variant="secondary">
                              {type.label}
                            </Badge>
                            <Badge className={priority.color} variant="secondary">
                              {priority.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm">{selectedEvent.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{selectedEvent.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm">{formatTime(selectedEvent.time)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={typeConfig[selectedEvent.type].color}>
                    {typeConfig[selectedEvent.type].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={priorityConfig[selectedEvent.priority].color}>
                    {priorityConfig[selectedEvent.priority].label}
                  </Badge>
                </div>
              </div>
              
              {selectedEvent.patientName && (
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm">{selectedEvent.patientName}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditClick(selectedEvent)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleRescheduleClick(selectedEvent)}
                >
                  Reschedule
                </Button>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => handleDeleteClick(selectedEvent)}
              >
                Delete Event
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {eventToEdit && (
            <EditEventForm 
              event={eventToEdit}
              onSubmit={(updatedEvent) => {
                updateEvent(eventToEdit.id, updatedEvent);
                setIsEditDialogOpen(false);
                setEventToEdit(null);
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEventToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Event Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Event</DialogTitle>
          </DialogHeader>
          {eventToReschedule && (
            <RescheduleEventForm 
              event={eventToReschedule}
              onSubmit={(updatedEvent) => {
                updateEvent(eventToReschedule.id, updatedEvent);
                setIsRescheduleDialogOpen(false);
                setEventToReschedule(null);
              }}
              onCancel={() => {
                setIsRescheduleDialogOpen(false);
                setEventToReschedule(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          {eventToDelete && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete the event "{eventToDelete.title}"?
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setEventToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => deleteEvent(eventToDelete.id)}
                >
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Event Form Component
function CreateEventForm({ onSubmit }: { onSubmit: (event: Omit<CalendarEvent, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "appointment" as "appointment" | "task" | "referral" | "meeting",
    date: new Date().toISOString().split('T')[0], // Default to today
    time: "09:00",
    duration: 30,
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    patientName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the event object
    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      description: formData.description,
      priority: formData.priority,
      patientName: formData.patientName || undefined,
      status: "scheduled"
    };
    
    // Submit the event
    onSubmit(newEvent);
    
    // Reset form
    setFormData({
      title: "",
      type: "appointment",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      duration: 30,
      description: "",
      priority: "medium",
      patientName: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as "appointment" | "task" | "referral" | "meeting" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
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
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
          min="15"
          step="15"
        />
      </div>
      
      {formData.type === "appointment" && (
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">Create Event</Button>
    </form>
  );
}

// Edit Event Form Component
function EditEventForm({ 
  event, 
  onSubmit, 
  onCancel 
}: { 
  event: CalendarEvent; 
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    duration: event.duration,
    description: event.description,
    priority: event.priority,
    patientName: event.patientName || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEvent: Partial<CalendarEvent> = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      description: formData.description,
      priority: formData.priority,
      patientName: formData.patientName || undefined
    };
    
    onSubmit(updatedEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Event Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-type">Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as "appointment" | "task" | "referral" | "meeting" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
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
          <Label htmlFor="edit-date">Date</Label>
          <Input
            id="edit-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-time">Time</Label>
          <Input
            id="edit-time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-duration">Duration (minutes)</Label>
        <Input
          id="edit-duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
          min="15"
          step="15"
        />
      </div>
      
      {formData.type === "appointment" && (
        <div>
          <Label htmlFor="edit-patientName">Patient Name</Label>
          <Input
            id="edit-patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">Update Event</Button>
      </div>
    </form>
  );
}

// Reschedule Event Form Component
function RescheduleEventForm({ 
  event, 
  onSubmit, 
  onCancel 
}: { 
  event: CalendarEvent; 
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    date: event.date,
    time: event.time,
    duration: event.duration
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEvent: Partial<CalendarEvent> = {
      date: formData.date,
      time: formData.time,
      duration: formData.duration
    };
    
    onSubmit(updatedEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Event Title</Label>
        <p className="text-sm font-medium">{event.title}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reschedule-date">New Date</Label>
          <Input
            id="reschedule-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="reschedule-time">New Time</Label>
          <Input
            id="reschedule-time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="reschedule-duration">Duration (minutes)</Label>
        <Input
          id="reschedule-duration"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
          min="15"
          step="15"
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">Reschedule Event</Button>
      </div>
    </form>
  );
}
