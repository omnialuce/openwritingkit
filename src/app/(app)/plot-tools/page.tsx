
// src/app/(app)/plot-tools/page.tsx
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
import { Network, PlusCircle, Edit, Trash2, AlignLeft, AlertTriangle, Download, Save, GripVertical, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getPlotPointsStorageKey, getTimelineEventsStorageKey, getOutlineStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

// --- Plot Point Tracker ---
interface PlotPoint {
  id: string;
  name: string; 
  description: string;
}

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
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Plot Point State
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [isLoadingPlotPoints, setIsLoadingPlotPoints] = useState(false);

  // Timeline Event State
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  
  // Scene Summaries State
  const [sceneSummaries, setSceneSummaries] = useState<OutlineItem[]>([]);
  
  const getPlotPointTemplate = useCallback((): PlotPoint[] => [
    { id: 'pp1', name: t('plot_tools.plot_points.template.exposition'), description: '' },
    { id: 'pp2', name: t('plot_tools.plot_points.template.inciting_incident'), description: '' },
    { id: 'pp3', name: t('plot_tools.plot_points.template.rising_action_1'), description: '' },
    { id: 'pp4', name: t('plot_tools.plot_points.template.rising_action_2'), description: '' },
    { id: 'pp5', name: t('plot_tools.plot_points.template.rising_action_3'), description: '' },
    { id: 'pp6', name: t('plot_tools.plot_points.template.climax'), description: '' },
    { id: 'pp7', name: t('plot_tools.plot_points.template.falling_action'), description: '' },
    { id: 'pp8', name: t('plot_tools.plot_points.template.resolution'), description: '' },
  ], [t]);


  // Load Plot Points
  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const plotPointsStorageKey = getPlotPointsStorageKey(activeStoryId, user.uid);
      storage.getItem<PlotPoint[]>(plotPointsStorageKey).then(storedPlotPoints => {
        if (storedPlotPoints) {
            setPlotPoints(storedPlotPoints);
        } else {
            const initialTemplate = getPlotPointTemplate();
            setPlotPoints(initialTemplate);
            storage.setItem(plotPointsStorageKey, initialTemplate);
        }
      });
    } else if (!activeStoryId) {
      setPlotPoints([]); 
    }
  }, [activeStoryId, user, getPlotPointTemplate]);

  // Load Timeline Events
  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const timelineEventsStorageKey = getTimelineEventsStorageKey(activeStoryId, user.uid);
      storage.getItem<TimelineEvent[]>(timelineEventsStorageKey).then(storedEvents => {
        setTimelineEvents(storedEvents || []);
      });
    } else if (!activeStoryId) {
      setTimelineEvents([]); 
    }
  }, [activeStoryId, user]);
  
  // Load Outline Items for Scene Summaries
  useEffect(() => {
      if (typeof window !== 'undefined' && activeStoryId && user) {
          const outlineStorageKey = getOutlineStorageKey(activeStoryId, user.uid);
          storage.getItem<OutlineItem[]>(outlineStorageKey).then(storedOutline => {
            if (storedOutline) {
                try {
                    const allItems: OutlineItem[] = storedOutline;
                    const scenes = extractScenesRecursive(allItems);
                    setSceneSummaries(scenes);
                } catch (e) {
                    console.error("Failed to parse outline for scenes", e);
                    setSceneSummaries([]);
                }
            } else {
                setSceneSummaries([]);
            }
          });
      } else if (!activeStoryId) {
          setSceneSummaries([]);
      }
  }, [activeStoryId, user]);

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

  const handlePlotPointChange = (id: string, newDescription: string) => {
    if (!activeStoryId || !user) return;
    setPlotPoints(prev => prev.map(pp => pp.id === id ? { ...pp, description: newDescription } : pp));
  };
  
  const handleSavePlotPoints = async () => {
    if (!activeStoryId || !user) return;
    setIsLoadingPlotPoints(true);
    const plotPointsStorageKey = getPlotPointsStorageKey(activeStoryId, user.uid);
    try {
        await storage.setItem(plotPointsStorageKey, plotPoints);
        toast({ title: t('common.save'), description: t('plot_tools.toast.plot_points_saved') });
    } catch (e) {
        toast({ title: t('common.error'), description: t('plot_tools.toast.plot_points_error'), variant: 'destructive'});
    } finally {
        setIsLoadingPlotPoints(false);
    }
  };

  const saveTimelineEvents = (updatedEvents: TimelineEvent[]) => {
     setTimelineEvents(updatedEvents);
  };
  
  const handleSaveTimeline = async () => {
    if (!activeStoryId || !user) return;
    setIsLoadingTimeline(true);
    const timelineEventsStorageKey = getTimelineEventsStorageKey(activeStoryId, user.uid);
     try {
        await storage.setItem(timelineEventsStorageKey, timelineEvents);
        toast({ title: t('common.save'), description: t('plot_tools.toast.timeline_saved') });
    } catch (e) {
        toast({ title: t('common.error'), description: t('plot_tools.toast.timeline_error'), variant: 'destructive'});
    } finally {
        setIsLoadingTimeline(false);
    }
  };
  
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const newItems = Array.from(timelineEvents);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    setTimelineEvents(newItems);
  };
  
  const handleExport = () => {
    if (!activeStoryId) return;
    let textContent = `--- ${t('plot_tools.export.plot_points_header')} ---\n\n`;
    plotPoints.forEach(pp => {
      textContent += `[${pp.name}]\n`;
      textContent += `${pp.description || t('plot_tools.export.no_description')}\n\n`;
    });

    textContent += `\n--- ${t('plot_tools.export.timeline_header')} ---\n\n`;
    timelineEvents.forEach(event => {
      textContent += `${t('plot_tools.export.event_title')}: ${event.title}\n`;
      textContent += `${t('plot_tools.export.event_datetime')}: ${event.dateTime || 'N/A'}\n`;
      textContent += `${t('plot_tools.export.event_description')}: ${event.description || t('plot_tools.export.no_description')}\n\n`;
    });
    
    textContent += `\n--- ${t('plot_tools.export.scenes_header')} ---\n\n`;
    sceneSummaries.forEach(scene => {
        textContent += `${t('plot_tools.export.scene_title')}: ${scene.title}\n`;
        textContent += `${t('plot_tools.export.scene_notes')}: ${scene.notes || t('plot_tools.export.no_notes')}\n\n`;
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
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('plot_tools.no_story.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('plot_tools.no_story.description_1')} <Link href="/stories" className="text-primary hover:underline">{t('plot_tools.no_story.description_2')}</Link> {t('plot_tools.no_story.description_3')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Network className="mr-3 h-8 w-8 text-primary" /> {t('plot_tools.title')}
          </h1>
          <p className="text-muted-foreground">{t('plot_tools.description')}</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!activeStoryId}>
          <Download className="mr-2 h-5 w-5" /> {t('plot_tools.export_button')}
        </Button>
      </div>

      {/* Plot Point Tracker Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>{t('plot_tools.plot_points.title')}</CardTitle>
              <CardDescription>{t('plot_tools.plot_points.description')}</CardDescription>
            </div>
            <Button onClick={handleSavePlotPoints} disabled={isLoadingPlotPoints}>
              {isLoadingPlotPoints ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('common.save')} {t('plot_tools.plot_points.title_short')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {plotPoints.map(pp => (
            <div key={pp.id} className="space-y-2">
              <Label htmlFor={`plotpoint-${pp.id}`} className="text-base font-semibold">{pp.name}</Label>
              <Textarea
                id={`plotpoint-${pp.id}`}
                value={pp.description}
                onChange={(e) => handlePlotPointChange(pp.id, e.target.value)}
                placeholder={t('plot_tools.plot_points.placeholder', { name: pp.name.toLowerCase() })}
                rows={4}
                className="text-sm"
                disabled={!activeStoryId}
              />
            </div>
          ))}
           {plotPoints.length === 0 && activeStoryId && (
             <p className="text-muted-foreground">{t('plot_tools.plot_points.loading')}</p>
           )}
        </CardContent>
      </Card>

      {/* Timeline Creator Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>{t('plot_tools.timeline.title')}</CardTitle>
                <CardDescription>{t('plot_tools.timeline.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleOpenCreateEventDialog} className="mt-2 sm:mt-0" disabled={!activeStoryId}>
                  <PlusCircle className="mr-2 h-5 w-5" /> {t('plot_tools.timeline.add_button')}
                </Button>
                <Button onClick={handleSaveTimeline} disabled={isLoadingTimeline}>
                    {isLoadingTimeline ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t('common.save')} {t('plot_tools.timeline.title_short')}
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t('plot_tools.timeline.empty')}</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="timeline-droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <ScrollArea className="h-auto max-h-[60vh]">
                      <div className="space-y-4 pr-3">
                        {timelineEvents.map((event, index) => (
                          <Draggable key={event.id} draggableId={event.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className={cn(snapshot.isDragging && "shadow-lg opacity-80")}>
                                <Card className="bg-muted/30">
                                  <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start gap-2">
                                        <div {...provided.dragHandleProps} className="pt-1">
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                        </div>
                                        <div>
                                          <CardTitle className="text-lg">{event.title}</CardTitle>
                                          {event.dateTime && <p className="text-xs text-muted-foreground font-medium">{event.dateTime}</p>}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditEventDialog(event)} title={t('plot_tools.timeline.edit_button_title')} disabled={!activeStoryId}>
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" title={t('plot_tools.timeline.delete_button_title')} disabled={!activeStoryId}>
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>{t('plot_tools.timeline.delete_dialog.title')}</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {t('plot_tools.timeline.delete_dialog.description_1')} "{event.title}". {t('plot_tools.timeline.delete_dialog.description_2')}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">
                                                {t('common.delete')}
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Scene Summaries Section (Integrated) */}
      <Card>
        <CardHeader>
          <CardTitle>{t('plot_tools.scenes.title')}</CardTitle>
          <CardDescription>{t('plot_tools.scenes.description')}</CardDescription>
        </CardHeader>
        <CardContent>
           {sceneSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <AlignLeft className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('plot_tools.scenes.empty_1')} <Link href="/outline" className="text-primary hover:underline">{t('plot_tools.scenes.empty_2')}</Link> {t('plot_tools.scenes.empty_3')}
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
                <DialogTitle>{editingEvent ? t('plot_tools.timeline.edit_dialog.title') : t('plot_tools.timeline.create_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? t('plot_tools.timeline.edit_dialog.description') : t('plot_tools.timeline.create_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEventSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">{t('plot_tools.timeline.fields.title')}</Label>
                  <Input id="event-title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-datetime" className="text-right">{t('plot_tools.timeline.fields.datetime')}</Label>
                  <Input 
                    id="event-datetime" 
                    value={eventDateTime} 
                    onChange={(e) => setEventDateTime(e.target.value)} 
                    className="col-span-3" 
                    placeholder={t('plot_tools.timeline.fields.datetime_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="event-description" className="text-right pt-2">{t('plot_tools.timeline.fields.description')}</Label>
                  <Textarea id="event-description" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="col-span-3" rows={5} placeholder={t('plot_tools.timeline.fields.description_placeholder')}/>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{editingEvent ? t('common.save') : t('plot_tools.timeline.create_dialog.create_button')}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}
