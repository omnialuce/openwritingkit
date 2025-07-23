// src/app/(app)/plot-tools/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Network, PlusCircle, Edit, Trash2, AlignLeft, AlertTriangle, Download, Save, GripVertical, Loader2, BookCopy, Settings, Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getTimelineEventsStorageKey, getPlotSettingsKey, type PlotSettings } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { plotTemplates, type PlotTemplate } from '@/lib/plot-templates';
import { ExportButton } from '@/components/plot-tools/ExportButton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Timeline Creator ---
interface TimelineEvent {
  id: string;
  title: string;
  dateTime: string;
  description: string;
}

export default function PlotToolsPage() {
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Timeline Event State
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // Plot Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [plotSettings, setPlotSettings] = useState<PlotSettings>({ showTemplates: true, primaryTemplate: 'save-the-cat' });

  // Load Timeline Events
  useEffect(() => {
    if (activeStoryId && user) {
      const timelineEventsStorageKey = getTimelineEventsStorageKey(activeStoryId, user.uid);
      storage.getItem<TimelineEvent[]>(timelineEventsStorageKey).then(storedEvents => {
        setTimelineEvents(storedEvents || []);
      });
      
      const plotSettingsKey = getPlotSettingsKey(activeStoryId, user.uid);
      storage.getItem<PlotSettings>(plotSettingsKey).then(storedSettings => {
        if(storedSettings) {
          setPlotSettings(storedSettings);
        } else {
          // Default settings
          const defaultSettings: PlotSettings = { showTemplates: true, primaryTemplate: 'save-the-cat' };
          setPlotSettings(defaultSettings);
          storage.setItem(plotSettingsKey, defaultSettings);
        }
      })
    } else {
      setTimelineEvents([]);
      setPlotSettings({ showTemplates: true, primaryTemplate: 'save-the-cat' });
    }
  }, [activeStoryId, user]);

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

  const handleSettingsChange = (key: keyof PlotSettings, value: any) => {
    setPlotSettings(prev => {
        const newSettings = {...prev, [key]: value};
        if(activeStoryId && user) {
            const plotSettingsKey = getPlotSettingsKey(activeStoryId, user.uid);
            storage.setItem(plotSettingsKey, newSettings);
        }
        return newSettings;
    });
  }

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
         <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-5 w-5" /> {t('plot_tools.settings.button')}
        </Button>
      </div>

       {plotSettings.showTemplates && (
        <Card>
            <CardHeader>
                <CardTitle>{t('plot_tools.templates.title')}</CardTitle>
                <CardDescription>{t('plot_tools.templates.description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plotTemplates.map(template => (
                    <Card key={template.id} className={cn("flex flex-col", plotSettings.primaryTemplate === template.id && "border-primary")}>
                        <CardHeader>
                            <BookCopy className="h-8 w-8 text-primary mb-2"/>
                            <CardTitle>{t(template.titleKey as any)}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-sm text-muted-foreground">{t(template.descriptionKey as any)}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/plot-tools/${template.id}`}>{t('plot_tools.templates.use_button')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>
       )}

      {/* Timeline Creator Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle>{t('plot_tools.timeline.title')}</CardTitle>
                <CardDescription>{t('plot_tools.timeline.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
                <ExportButton contentId="timeline-export" type="timeline" data={timelineEvents} />
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
                      <div className="space-y-4 pr-3" id="timeline-export">
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
      
       {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('plot_tools.settings.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <Label htmlFor="show-templates">{t('plot_tools.settings.show_templates_label')}</Label>
                    <p className="text-xs text-muted-foreground">{t('plot_tools.settings.show_templates_desc')}</p>
                </div>
                <Switch 
                    id="show-templates"
                    checked={plotSettings.showTemplates}
                    onCheckedChange={(checked) => handleSettingsChange('showTemplates', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-template">{t('plot_tools.settings.primary_template_label')}</Label>
                <Select value={plotSettings.primaryTemplate} onValueChange={(value) => handleSettingsChange('primaryTemplate', value)}>
                    <SelectTrigger id="primary-template">
                        <SelectValue placeholder={t('plot_tools.settings.primary_template_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {plotTemplates.map(template => (
                             <SelectItem key={template.id} value={template.id}>{t(template.titleKey as any)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">{t('plot_tools.settings.primary_template_desc')}</p>
              </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button>{t('common.close')}</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}