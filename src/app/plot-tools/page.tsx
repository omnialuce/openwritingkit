// src/app/plot-tools/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Network, PlusCircle, Edit, Trash2, AlignLeft, AlertTriangle, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getPlotPointsStorageKey, getTimelineEventsStorageKey, getOutlineStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';

// --- Plot Point Tracker ---
interface PlotPoint {
  id: string;
  name: string; 
  description: string;
}

const initialPlotPointTemplate: PlotPoint[] = [
  { id: 'pp1', name: 'Exposition / Setup', description: '' },
  { id: 'pp2', name: 'Inciting Incident', description: '' },
  { id: 'pp3', name: 'Rising Action 1 (Plot Point 1)', description: '' },
  { id: 'pp4', name: 'Rising Action 2 (Midpoint)', description: '' },
  { id: 'pp5', name: 'Rising Action 3 (Plot Point 2)', description: '' },
  { id: 'pp6', name: 'Climax', description: '' },
  { id: 'pp7', name: 'Falling Action', description: '' },
  { id: 'pp8', name: 'Resolution / Denouement', description: '' },
];

// --- Timeline Creator ---
interface TimelineEvent {
  id: string;
  title: string;
  dateTime: string;
  description: string;
}

// --- Outline Integration ---
type OutlineItemType = 'Chapter' | 'Scene' | 'Plot Point/Notes';
interface OutlineItem {
  id: string;
  title: string;
  notes?: string;
  type: OutlineItemType;
  children: OutlineItem[];
}


export default function PlotToolsPage() {
  const { activeStoryId } = useStoryContext();

  // Plot Point State
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);

  // Timeline Event State
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  
  // Scene Summaries State
  const [sceneSummaries, setSceneSummaries] = useState<OutlineItem[]>([]);

  // Load Plot Points
  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const plotPointsStorageKey = getPlotPointsStorageKey(activeStoryId);
      const storedPlotPoints = localStorage.getItem(plotPointsStorageKey);
      if (storedPlotPoints) {
        setPlotPoints(JSON.parse(storedPlotPoints));
      } else {
        // If no plot points for this story, initialize with template and save
        setPlotPoints(initialPlotPointTemplate);
        localStorage.setItem(plotPointsStorageKey, JSON.stringify(initialPlotPointTemplate));
      }
    } else if (!activeStoryId) {
      setPlotPoints([]); // Clear if no active story
    }
  }, [activeStoryId]);

  // Load Timeline Events
  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const timelineEventsStorageKey = getTimelineEventsStorageKey(activeStoryId);
      const storedTimelineEvents = localStorage.getItem(timelineEventsStorageKey);
      if (storedTimelineEvents) {
        setTimelineEvents(JSON.parse(storedTimelineEvents));
      } else {
        setTimelineEvents([]); // No timeline events for this story yet
      }
    } else if (!activeStoryId) {
      setTimelineEvents([]); // Clear if no active story
    }
  }, [activeStoryId]);
  
  // Load Outline Items for Scene Summaries
  useEffect(() => {
      if (typeof window !== 'undefined' && activeStoryId) {
          const outlineStorageKey = getOutlineStorageKey(activeStoryId);
          const storedOutline = localStorage.getItem(outlineStorageKey);
          if (storedOutline) {
              try {
                  const allItems: OutlineItem[] = JSON.parse(storedOutline);
                  const scenes = extractScenesRecursive(allItems);
                  setSceneSummaries(scenes);
              } catch (e) {
                  console.error("Failed to parse outline for scenes", e);
                  setSceneSummaries([]);
              }
          } else {
              setSceneSummaries([]);
          }
      } else if (!activeStoryId) {
          setSceneSummaries([]);
      }
  }, [activeStoryId]);

  const extractScenesRecursive = (items: OutlineItem[]): OutlineItem[] => {
    let scenes: OutlineItem[] = [];
    for (const item of items) {
      if (item.type === 'Scene') {
        scenes.push(item);
      }
      if (item.children && item.children.length > 0) {
        scenes = scenes.concat(extractScenesRecursive(item.children));
      }
    }
    return scenes;
  };


  // Save Plot Points
  const handlePlotPointChange = (id: string, newDescription: string) => {
    if (!activeStoryId) return;
    const plotPointsStorageKey = getPlotPointsStorageKey(activeStoryId);
    const updatedPlotPoints = plotPoints.map(pp => 
      pp.id === id ? { ...pp, description: newDescription } : pp
    );
    setPlotPoints(updatedPlotPoints);
    if (typeof window !== 'undefined') {
      localStorage.setItem(plotPointsStorageKey, JSON.stringify(updatedPlotPoints));
    }
  };

  // Save Timeline Events (helper)
  const saveTimelineEvents = (updatedEvents: TimelineEvent[]) => {
    if (!activeStoryId) return;
    const timelineEventsStorageKey = getTimelineEventsStorageKey(activeStoryId);
    setTimelineEvents(updatedEvents);
    if (typeof window !== 'undefined') {
      localStorage.setItem(timelineEventsStorageKey, JSON.stringify(updatedEvents));
    }
  };
  
  // Timeline Event Dialog and CRUD
  const resetEventForm = () => {
    setEventTitle('');
    setEventDateTime('');
    setEventDescription('');
    setEditingEvent(null);
  };

  const handleOpenCreateEventDialog = () => {
    if(!activeStoryId) return;
    resetEventForm();
    setIsEventDialogOpen(true);
  };

  const handleOpenEditEventDialog = (event: TimelineEvent) => {
     if(!activeStoryId) return;
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDateTime(event.dateTime);
    setEventDescription(event.description);
    setIsEventDialogOpen(true);
  };

  const handleEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !activeStoryId) return;

    const newEventData: Omit<TimelineEvent, 'id'> = {
      title: eventTitle.trim(),
      dateTime: eventDateTime.trim(),
      description: eventDescription.trim(),
    };

    if (editingEvent) {
      const updatedEvents = timelineEvents.map(event =>
        event.id === editingEvent.id ? { ...event, ...newEventData } : event
      );
      saveTimelineEvents(updatedEvents);
    } else {
      const newEventWithId = { ...newEventData, id: Date.now().toString() };
      saveTimelineEvents([...timelineEvents, newEventWithId]);
    }
    setIsEventDialogOpen(false);
    resetEventForm();
  };

  const handleDeleteEvent = (id: string) => {
    if(!activeStoryId) return;
    const updatedEvents = timelineEvents.filter(event => event.id !== id);
    saveTimelineEvents(updatedEvents);
  };
  
  const handleExport = () => {
    if (!activeStoryId) return;
    let textContent = '--- PLOT POINTS ---\n\n';
    plotPoints.forEach(pp => {
      textContent += `[${pp.name}]\n`;
      textContent += `${pp.description || 'No description.'}\n\n`;
    });

    textContent += '\n--- TIMELINE EVENTS ---\n\n';
    timelineEvents.forEach(event => {
      textContent += `Event: ${event.title}\n`;
      textContent += `Date/Time: ${event.dateTime || 'N/A'}\n`;
      textContent += `Description: ${event.description || 'No description.'}\n\n`;
    });
    
    textContent += '\n--- SCENE SUMMARIES ---\n\n';
    sceneSummaries.forEach(scene => {
        textContent += `Scene: ${scene.title}\n`;
        textContent += `Notes: ${scene.notes || 'No notes.'}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plot_tools_export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select or create a story from the <Link href="/stories" className="text-primary hover:underline">Stories page</Link> to use plot tools.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Network className="mr-3 h-8 w-8 text-primary" /> Plot Development Tools
          </h1>
          <p className="text-muted-foreground">Structure your narrative, track key points, and build your timeline for the current story.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!activeStoryId}>
          <Download className="mr-2 h-5 w-5" /> Export All
        </Button>
      </div>

      {/* Plot Point Tracker Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plot Point Tracker</CardTitle>
          <CardDescription>Outline the key moments of your story using a common structure. Describe what happens at each point.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {plotPoints.map(pp => (
            <div key={pp.id} className="space-y-2">
              <Label htmlFor={`plotpoint-${pp.id}`} className="text-base font-semibold">{pp.name}</Label>
              <Textarea
                id={`plotpoint-${pp.id}`}
                value={pp.description}
                onChange={(e) => handlePlotPointChange(pp.id, e.target.value)}
                placeholder={`Describe the ${pp.name.toLowerCase()} of your story...`}
                rows={4}
                className="text-sm"
                disabled={!activeStoryId}
              />
            </div>
          ))}
           {plotPoints.length === 0 && activeStoryId && (
             <p className="text-muted-foreground">Loading plot points or no plot points defined for this story yet.</p>
           )}
        </CardContent>
      </Card>

      {/* Timeline Creator Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>Timeline Creator</CardTitle>
                <CardDescription>Log important events, scenes, or historical points in chronological order. Use the date/time field flexibly.</CardDescription>
            </div>
            <Button onClick={handleOpenCreateEventDialog} className="mt-2 sm:mt-0" disabled={!activeStoryId}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Timeline Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No timeline events yet for this story. Add one to start building your timeline.</p>
          ) : (
            <ScrollArea className="h-auto max-h-[60vh]">
              <div className="space-y-4 pr-3">
                {timelineEvents.map(event => (
                  <Card key={event.id} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            {event.dateTime && <p className="text-xs text-muted-foreground font-medium">{event.dateTime}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditEventDialog(event)} title="Edit Event" disabled={!activeStoryId}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete Event" disabled={!activeStoryId}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Timeline Event?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the event: "{event.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    {event.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Scene Summaries Section (Integrated) */}
      <Card>
        <CardHeader>
          <CardTitle>Scene Summaries</CardTitle>
          <CardDescription>Review summaries of individual scenes from your Outline Builder.</CardDescription>
        </CardHeader>
        <CardContent>
           {sceneSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <AlignLeft className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No scenes found in the Outline Builder for this story. Go to the <Link href="/outline" className="text-primary hover:underline">Outline Builder</Link> to add some.
                  </p>
                </div>
            ) : (
                <ScrollArea className="h-auto max-h-[60vh]">
                    <div className="space-y-4 pr-3">
                        {sceneSummaries.map(scene => (
                            <Card key={scene.id} className="bg-muted/30">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{scene.title}</CardTitle>
                                </CardHeader>
                                {scene.notes && (
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scene.notes}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={(isOpen) => {
          setIsEventDialogOpen(isOpen);
          if (!isOpen) resetEventForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1 pr-3">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Timeline Event' : 'Create New Timeline Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update the details for this event.' : 'Add a new event to your timeline.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEventSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">Title</Label>
                  <Input id="event-title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-datetime" className="text-right">Date/Time</Label>
                  <Input 
                    id="event-datetime" 
                    value={eventDateTime} 
                    onChange={(e) => setEventDateTime(e.target.value)} 
                    className="col-span-3" 
                    placeholder="e.g., Day 1, Morning; Chapter 5; 20 BBY"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="event-description" className="text-right pt-2">Description</Label>
                  <Textarea id="event-description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="col-span-3" rows={5} placeholder="Describe the event..."/>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}
