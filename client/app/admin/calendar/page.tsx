"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  ArrowRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Event interface - supports multi-day events
interface CalendarEvent {
  id: string;
  title: string;
  type: "appointment" | "task" | "referral" | "meeting";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  patientId?: string;
  patientName?: string;
  description: string;
  status: "scheduled" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
}

// Mock data with multi-day events
const initialMockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Patient Consultation - John Smith",
    type: "appointment",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    patientId: "P001",
    patientName: "John Smith",
    description: "Follow-up consultation for hypertension management",
    status: "scheduled",
    priority: "high",
  },
  {
    id: "2",
    title: "Task Review - Blood Pressure Monitoring",
    type: "task",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    description: "Review blood pressure readings for assigned patients",
    status: "scheduled",
    priority: "medium",
  },
  {
    id: "3",
    title: "Referral Meeting - Cardiology",
    type: "referral",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    description: "Discuss patient referral to cardiology department",
    status: "scheduled",
    priority: "high",
  },
  {
    id: "4",
    title: "Patient Consultation - Maria Garcia",
    type: "appointment",
    startDate: "2024-01-16",
    endDate: "2024-01-16",
    patientId: "P002",
    patientName: "Maria Garcia",
    description: "Diabetes management consultation",
    status: "scheduled",
    priority: "medium",
  },
  {
    id: "5",
    title: "Team Meeting",
    type: "meeting",
    startDate: "2024-01-16",
    endDate: "2024-01-16",
    description: "Weekly team meeting to discuss patient cases",
    status: "scheduled",
    priority: "low",
  },
  {
    id: "6",
    title: "Multi-day Project Review",
    type: "task",
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    description: "Review and update project documentation",
    status: "scheduled",
    priority: "high",
  },
];

const typeConfig = {
  appointment: {
    label: "Appointment",
    bgColor: "bg-blue-500/20 dark:bg-blue-500/30",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-500/40 dark:border-blue-500/50",
    barColor: "bg-blue-500",
    icon: User,
  },
  task: {
    label: "Task",
    bgColor: "bg-green-500/20 dark:bg-green-500/30",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-500/40 dark:border-green-500/50",
    barColor: "bg-green-500",
    icon: FileText,
  },
  referral: {
    label: "Referral",
    bgColor: "bg-orange-500/20 dark:bg-orange-500/30",
    textColor: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-500/40 dark:border-orange-500/50",
    barColor: "bg-orange-500",
    icon: ArrowRight,
  },
  meeting: {
    label: "Meeting",
    bgColor: "bg-purple-500/20 dark:bg-purple-500/30",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-500/40 dark:border-purple-500/50",
    barColor: "bg-purple-500",
    icon: CalendarIcon,
  },
};

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  high: {
    label: "High",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [eventToReschedule, setEventToReschedule] =
    useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEvent[]>(initialMockEvents);

  // Get calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on the Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    // Normalize date to midnight for comparison (ignore time)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const normalizedDate = new Date(year, month, day);

    return events.filter((event) => {
      // Parse event dates and normalize to midnight
      const [startYear, startMonth, startDay] = event.startDate
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = event.endDate.split("-").map(Number);

      const eventStart = new Date(startYear, startMonth - 1, startDay);
      const eventEnd = new Date(endYear, endMonth - 1, endDay);

      return normalizedDate >= eventStart && normalizedDate <= eventEnd;
    });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get month/year string
  const getMonthYearString = () => {
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Event handlers
  const addEvent = (newEvent: Omit<CalendarEvent, "id">) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: Date.now().toString(),
      status: "scheduled",
    };
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const updateEvent = (
    eventId: string,
    updatedEvent: Partial<CalendarEvent>
  ) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
    setEventToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleEditClick = (event: CalendarEvent) => {
    setEventToEdit(event);
    setIsEditDialogOpen(true);
    setSelectedEvent(null);
  };

  const handleRescheduleClick = (event: CalendarEvent) => {
    setEventToReschedule(event);
    setIsRescheduleDialogOpen(true);
    setSelectedEvent(null);
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your healthcare appointments, tasks, and events
          </p>
        </div>
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

      {/* Calendar Navigation */}
      <div className="bg-muted/50 dark:bg-[#171717] rounded-lg border border-border">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-9 w-9 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-9 w-9 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-9 px-3 hover:bg-muted font-medium"
            >
              Today
            </Button>
          </div>
          <div className="text-xl font-semibold text-foreground">
            {getMonthYearString()}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold bg-muted text-muted-foreground border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const date = dayInfo.date;
              const isCurrentMonth = dayInfo.isCurrentMonth;
              const dayEvents = getEventsForDate(date);

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[150px] border-r border-b border-border last:border-r-0 relative",
                    isCurrentMonth ? "bg-card" : "bg-muted/30 dark:bg-muted/10"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 h-full flex flex-col",
                      !isCurrentMonth && "opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-bold mb-1.5 w-fit",
                        isToday(date)
                          ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                          : "text-foreground"
                      )}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1 flex-1 overflow-y-auto min-h-0">
                      {dayEvents.map((event) => {
                        // Normalize dates for comparison
                        const [startYear, startMonth, startDay] =
                          event.startDate.split("-").map(Number);
                        const [endYear, endMonth, endDay] = event.endDate
                          .split("-")
                          .map(Number);
                        const eventStart = new Date(
                          startYear,
                          startMonth - 1,
                          startDay
                        );
                        const eventEnd = new Date(
                          endYear,
                          endMonth - 1,
                          endDay
                        );

                        const dateYear = date.getFullYear();
                        const dateMonth = date.getMonth();
                        const dateDay = date.getDate();
                        const normalizedDate = new Date(
                          dateYear,
                          dateMonth,
                          dateDay
                        );

                        const isStartDay =
                          normalizedDate.getTime() === eventStart.getTime();
                        const isContinuationDay =
                          normalizedDate > eventStart &&
                          normalizedDate <= eventEnd;
                        const type = typeConfig[event.type];

                        if (isStartDay) {
                          // Render full event card on start day
                          const isMultiDay =
                            eventStart.getTime() !== eventEnd.getTime();

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs p-1.5 rounded cursor-pointer hover:opacity-90 border",
                                type.bgColor,
                                type.textColor,
                                type.borderColor,
                                "mb-1"
                              )}
                              onClick={() => setSelectedEvent(event)}
                              title={
                                isMultiDay
                                  ? `${event.title} (${event.startDate} to ${event.endDate})`
                                  : event.title
                              }
                            >
                              <div className="font-semibold truncate">
                                {event.title}
                              </div>
                              {event.patientName && (
                                <div className="truncate text-[10px] opacity-80 mt-0.5">
                                  {event.patientName}
                                </div>
                              )}
                            </div>
                          );
                        } else if (isContinuationDay) {
                          // Render continuation bar with event title for multi-day events
                          return (
                            <div
                              key={`continuation-${event.id}`}
                              className={cn(
                                "px-1.5 py-0.5 rounded mb-1 cursor-pointer hover:opacity-90 border",
                                type.bgColor,
                                type.textColor,
                                type.borderColor,
                                "opacity-80"
                              )}
                              title={event.title}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="text-xs font-medium truncate">
                                {event.title}
                              </div>
                              {event.patientName && (
                                <div className="text-[10px] truncate opacity-70">
                                  {event.patientName}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
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
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm">{selectedEvent.startDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm">{selectedEvent.endDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge
                    className={cn(
                      typeConfig[selectedEvent.type].bgColor,
                      typeConfig[selectedEvent.type].textColor,
                      typeConfig[selectedEvent.type].borderColor
                    )}
                  >
                    {typeConfig[selectedEvent.type].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge
                    className={priorityConfig[selectedEvent.priority].color}
                  >
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
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
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
                  Are you sure you want to delete the event "
                  {eventToDelete.title}"?
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
function CreateEventForm({
  onSubmit,
}: {
  onSubmit: (event: Omit<CalendarEvent, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "appointment" as "appointment" | "task" | "referral" | "meeting",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    patientName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Omit<CalendarEvent, "id"> = {
      title: formData.title,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      priority: formData.priority,
      patientName: formData.patientName || undefined,
      status: "scheduled",
    };

    onSubmit(newEvent);

    // Reset form
    setFormData({
      title: "",
      type: "appointment",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      description: "",
      priority: "medium",
      patientName: "",
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
            onValueChange={(value) =>
              setFormData({
                ...formData,
                type: value as "appointment" | "task" | "referral" | "meeting",
              })
            }
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
            onValueChange={(value) =>
              setFormData({
                ...formData,
                priority: value as "low" | "medium" | "high",
              })
            }
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
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setFormData({
                ...formData,
                startDate: newStartDate,
                endDate:
                  newStartDate > formData.endDate
                    ? newStartDate
                    : formData.endDate,
              });
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            min={formData.startDate}
            required
          />
        </div>
      </div>

      {formData.type === "appointment" && (
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
          />
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Create Event
      </Button>
    </form>
  );
}

// Edit Event Form Component
function EditEventForm({
  event,
  onSubmit,
  onCancel,
}: {
  event: CalendarEvent;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event.title,
    type: event.type,
    startDate: event.startDate,
    endDate: event.endDate,
    description: event.description,
    priority: event.priority,
    patientName: event.patientName || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEvent: Partial<CalendarEvent> = {
      title: formData.title,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      priority: formData.priority,
      patientName: formData.patientName || undefined,
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
            onValueChange={(value) =>
              setFormData({
                ...formData,
                type: value as "appointment" | "task" | "referral" | "meeting",
              })
            }
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
            onValueChange={(value) =>
              setFormData({
                ...formData,
                priority: value as "low" | "medium" | "high",
              })
            }
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
          <Label htmlFor="edit-startDate">Start Date</Label>
          <Input
            id="edit-startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setFormData({
                ...formData,
                startDate: newStartDate,
                endDate:
                  newStartDate > formData.endDate
                    ? newStartDate
                    : formData.endDate,
              });
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-endDate">End Date</Label>
          <Input
            id="edit-endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            min={formData.startDate}
            required
          />
        </div>
      </div>

      {formData.type === "appointment" && (
        <div>
          <Label htmlFor="edit-patientName">Patient Name</Label>
          <Input
            id="edit-patientName"
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
          />
        </div>
      )}

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Update Event
        </Button>
      </div>
    </form>
  );
}

// Reschedule Event Form Component
function RescheduleEventForm({
  event,
  onSubmit,
  onCancel,
}: {
  event: CalendarEvent;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    startDate: event.startDate,
    endDate: event.endDate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEvent: Partial<CalendarEvent> = {
      startDate: formData.startDate,
      endDate: formData.endDate,
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
          <Label htmlFor="reschedule-startDate">New Start Date</Label>
          <Input
            id="reschedule-startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setFormData({
                ...formData,
                startDate: newStartDate,
                endDate:
                  newStartDate > formData.endDate
                    ? newStartDate
                    : formData.endDate,
              });
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="reschedule-endDate">New End Date</Label>
          <Input
            id="reschedule-endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            min={formData.startDate}
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Reschedule Event
        </Button>
      </div>
    </form>
  );
}
