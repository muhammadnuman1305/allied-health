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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [eventToReschedule, setEventToReschedule] =
    useState<CalendarEvent | null>(null);
  const [events] = useState<CalendarEvent[]>(initialMockEvents);

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

  // Event handlers - users can only request reschedule
  const requestReschedule = (
    eventId: string,
    updatedEvent: Partial<CalendarEvent>
  ) => {
    // In a real app, this would send a reschedule request to the admin
    // For now, we'll just log it (or show a toast notification)
    console.log("Reschedule request for event:", eventId, updatedEvent);
    // TODO: Implement API call to request reschedule
    setIsRescheduleDialogOpen(false);
    setEventToReschedule(null);
  };

  const handleRescheduleClick = (event: CalendarEvent) => {
    setEventToReschedule(event);
    setIsRescheduleDialogOpen(true);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View your healthcare appointments, tasks, and events
          </p>
        </div>
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

              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Badge className={priorityConfig[selectedEvent.priority].color}>
                  {priorityConfig[selectedEvent.priority].label}
                </Badge>
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

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleRescheduleClick(selectedEvent)}
              >
                Request Reschedule
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Reschedule Dialog */}
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
          </DialogHeader>
          {eventToReschedule && (
            <RescheduleEventForm
              event={eventToReschedule}
              onSubmit={(updatedEvent) => {
                requestReschedule(eventToReschedule.id, updatedEvent);
              }}
              onCancel={() => {
                setIsRescheduleDialogOpen(false);
                setEventToReschedule(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
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
