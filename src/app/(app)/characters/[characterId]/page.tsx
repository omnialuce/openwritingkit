// src/app/(app)/characters/[characterId]/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, User, Save, Loader2, AlertTriangle, Download } from 'lucide-react';
import { useStoryContext, getCharactersStorageKey, getCharacterSheetStorageKey, type CharacterProfile } from '@/contexts/StoryContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';

const characterSheetSections = {
  demographics: 'character_sheet.sections.demographics',
  physicalAppearance: 'character_sheet.sections.physical_appearance',
  history: 'character_sheet.sections.history',
  psychologicalTraits: 'character_sheet.sections.psychological_traits',
  communication: 'character_sheet.sections.communication',
  strengthsWeaknessesAbilities: 'character_sheet.sections.strengths_weaknesses_abilities',
  relationships: 'character_sheet.sections.relationships',
  characterGrowth: 'character_sheet.sections.character_growth',
};

const getCharacterSheetFields = (t: (key: any) => string) => ({
  demographics: [
    { id: 'name', label: t('character_sheet.fields.name'), type: 'display' },
    { id: 'age', label: t('character_sheet.fields.age') },
    { id: 'sexGender', label: t('character_sheet.fields.sex_gender') },
    { id: 'ethnicity', label: t('character_sheet.fields.ethnicity') },
    { id: 'occupation', label: t('character_sheet.fields.occupation') },
    { id: 'socioeconomicStatus', label: t('character_sheet.fields.socioeconomic_status') },
    { id: 'education', label: t('character_sheet.fields.education') },
    { id: 'demographicsNotes', label: t('character_sheet.fields.other_notes') },
  ],
  physicalAppearance: [
    { id: 'eyeColor', label: t('character_sheet.fields.eye_color') },
    { id: 'skinColor', label: t('character_sheet.fields.skin_color') },
    { id: 'hairColor', label: t('character_sheet.fields.hair_color') },
    { id: 'height', label: t('character_sheet.fields.height') },
    { id: 'weight', label: t('character_sheet.fields.weight') },
    { id: 'bodyType', label: t('character_sheet.fields.body_type') },
    { id: 'fitnessLevel', label: t('character_sheet.fields.fitness_level') },
    { id: 'tattoos', label: t('character_sheet.fields.tattoos') },
    { id: 'scarsBirthmarks', label: t('character_sheet.fields.scars_birthmarks') },
    { id: 'distinguishingFeatures', label: t('character_sheet.fields.distinguishing_features') },
    { id: 'disabilities', label: t('character_sheet.fields.disabilities') },
    { id: 'fashionStyle', label: t('character_sheet.fields.fashion_style') },
    { id: 'accessories', label: t('character_sheet.fields.accessories') },
    { id: 'grooming', label: t('character_sheet.fields.grooming') },
    { id: 'postureGait', label: t('character_sheet.fields.posture_gait') },
    { id: 'tics', label: t('character_sheet.fields.tics') },
    { id: 'coordination', label: t('character_sheet.fields.coordination') },
    { id: 'weaknesses', label: t('character_sheet.fields.physical_weaknesses') },
    { id: 'physicalAppearanceNotes', label: t('character_sheet.fields.other_notes') },
  ],
  history: [
    { id: 'birthDate', label: t('character_sheet.fields.birth_date') },
    { id: 'placeOfBirth', label: t('character_sheet.fields.place_of_birth') },
    { id: 'familyMembers', label: t('character_sheet.fields.family_members') },
    { id: 'notableEvents', label: t('character_sheet.fields.notable_events') },
    { id: 'criminalRecord', label: t('character_sheet.fields.criminal_record') },
    { id: 'affiliations', label: t('character_sheet.fields.affiliations') },
    { id: 'skeletons', label: t('character_sheet.fields.skeletons') },
    { id: 'historyNotes', label: t('character_sheet.fields.other_notes') },
  ],
  psychologicalTraits: [
    { id: 'personalityType', label: t('character_sheet.fields.personality_type') },
    { id: 'traits', label: t('character_sheet.fields.traits') },
    { id: 'temperament', label: t('character_sheet.fields.temperament') },
    { id: 'introvertExtrovert', label: t('character_sheet.fields.introvert_extrovert') },
    { id: 'mannerisms', label: t('character_sheet.fields.mannerisms') },
    { id: 'hobbies', label: t('character_sheet.fields.hobbies') },
    { id: 'skills', label: t('character_sheet.fields.skills') },
    { id: 'loves', label: t('character_sheet.fields.loves') },
    { id: 'morals', label: t('character_sheet.fields.morals') },
    { id: 'phobias', label: t('character_sheet.fields.phobias') },
    { id: 'angeredBy', label: t('character_sheet.fields.angered_by') },
    { id: 'petPeeves', label: t('character_sheet.fields.pet_peeves') },
    { id: 'obsessedWith', label: t('character_sheet.fields.obsessed_with') },
    { id: 'routines', label: t('character_sheet.fields.routines') },
    { id: 'badHabits', label: t('character_sheet.fields.bad_habits') },
    { id: 'desires', label: t('character_sheet.fields.desires') },
    { id: 'flaws', label: t('character_sheet.fields.flaws') },
    { id: 'quirks', label: t('character_sheet.fields.quirks') },
    { id: 'favoriteSayings', label: t('character_sheet.fields.favorite_sayings') },
    { id: 'secrets', label: t('character_sheet.fields.secrets') },
    { id: 'regrets', label: t('character_sheet.fields.regrets') },
    { id: 'accomplishments', label: t('character_sheet.fields.accomplishments') },
    { id: 'memories', label: t('character_sheet.fields.memories') },
    { id: 'psychologicalNotes', label: t('character_sheet.fields.other_notes') },
  ],
  communication: [
    { id: 'languages', label: t('character_sheet.fields.languages') },
    { id: 'commMethods', label: t('character_sheet.fields.comm_methods') },
    { id: 'accent', label: t('character_sheet.fields.accent') },
    { id: 'speechStyle', label: t('character_sheet.fields.speech_style') },
    { id: 'pitch', label: t('character_sheet.fields.pitch') },
    { id: 'laughter', label: t('character_sheet.fields.laughter') },
    { id: 'smile', label: t('character_sheet.fields.smile') },
    { id: 'gestures', label: t('character_sheet.fields.gestures') },
    { id: 'facialExpressions', label: t('character_sheet.fields.facial_expressions') },
    { id: 'verbalExpressions', label: t('character_sheet.fields.verbal_expressions') },
    { id: 'communicationNotes', label: t('character_sheet.fields.other_notes') },
  ],
  strengthsWeaknessesAbilities: [
    { id: 'physicalStrengths', label: t('character_sheet.fields.physical_strengths') },
    { id: 'physicalWeaknesses', label: t('character_sheet.fields.physical_weaknesses_2') },
    { id: 'intellectualStrengths', label: t('character_sheet.fields.intellectual_strengths') },
    { id: 'intellectualWeaknesses', label: t('character_sheet.fields.intellectual_weaknesses') },
    { id: 'interpersonalStrengths', label: t('character_sheet.fields.interpersonal_strengths') },
    { id: 'interpersonalWeaknesses', label: t('character_sheet.fields.interpersonal_weaknesses') },
    { id: 'abilities', label: t('character_sheet.fields.abilities') },
    { id: 'physicalConditions', label: t('character_sheet.fields.physical_conditions') },
    { id: 'mentalConditions', label: t('character_sheet.fields.mental_conditions') },
    { id: 'swaNotes', label: t('character_sheet.fields.other_notes') },
  ],
  relationships: [
    { id: 'partners', label: t('character_sheet.fields.partners') },
    { id: 'family', label: t('character_sheet.fields.family') },
    { id: 'friends', label: t('character_sheet.fields.friends') },
    { id: 'rivalsEnemies', label: t('character_sheet.fields.rivals_enemies') },
    { id: 'colleagues', label: t('character_sheet.fields.colleagues') },
    { id: 'socialMedia', label: t('character_sheet.fields.social_media') },
    { id: 'publicPerception', label: t('character_sheet.fields.public_perception') },
    { id: 'relationshipNotes', label: t('character_sheet.fields.other_notes') },
  ],
  characterGrowth: [
    { id: 'archetype', label: t('character_sheet.fields.archetype') },
    { id: 'arc', label: t('character_sheet.fields.arc') },
    { id: 'coreValues', label: t('character_sheet.fields.core_values') },
    { id: 'internalConflicts', label: t('character_sheet.fields.internal_conflicts') },
    { id: 'externalConflicts', label: t('character_sheet.fields.external_conflicts') },
    { id: 'goals', label: t('character_sheet.fields.goals') },
    { id: 'motivations', label: t('character_sheet.fields.motivations') },
    { id: 'epiphanies', label: t('character_sheet.fields.epiphanies') },
    { id: 'significantEvents', label: t('character_sheet.fields.significant_events') },
    { id: 'growthNotes', label: t('character_sheet.fields.other_notes') },
  ],
});


type SheetData = {
  [key: string]: string;
};

export default function CharacterSheetPage() {
  const { t } = useLanguage();
  const params = useParams();
  const characterId = params.characterId as string;
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const { toast } = useToast();
  
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const sheetStorageKey = useMemo(() => getCharacterSheetStorageKey(activeStoryId, characterId, user?.uid), [activeStoryId, characterId, user?.uid]);
  
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dynamicCharacterSheetFields = getCharacterSheetFields(t);

  const loadCharacterData = useCallback(async () => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
        const storageKey = getCharactersStorageKey(activeStoryId, user.uid);
        const storedCharacters = await storage.getItem<CharacterProfile[]>(storageKey);
        if (storedCharacters) {
            const foundChar = storedCharacters.find(c => c.id === characterId);
            setCharacter(foundChar || null);
        }
        
        const storedSheet = await storage.getItem<SheetData>(sheetStorageKey);
        if(storedSheet) {
            setSheetData(storedSheet);
        }
    }
    setIsMounted(true);
  }, [activeStoryId, characterId, user, sheetStorageKey]);

  useEffect(() => {
    loadCharacterData();
  }, [loadCharacterData]);


  const handleFieldChange = (fieldId: string, value: string) => {
    setSheetData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveChanges = async () => {
    if (!sheetStorageKey) return;
    setIsLoading(true);
    try {
        await storage.setItem(sheetStorageKey, sheetData);
        toast({ title: t('common.save'), description: t('character_sheet.toast_save_success') });
    } catch(e) {
        console.error("Failed to save character sheet:", e);
        toast({ title: t('common.error'), description: t('character_sheet.toast_save_error'), variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleExportSheet = () => {
    if (!character || !sheetData) return;

    let textContent = `${t('character_sheet.export.title_prefix')} ${character.name}\n`;
    textContent += `${t('character_sheet.export.role')}: ${character.role || t('character_sheet.export.not_applicable')}\n`;
    textContent += `${t('character_sheet.export.description')}: ${character.description || t('character_sheet.export.not_applicable')}\n`;
    textContent += `${t('character_sheet.export.backstory')}: ${character.backstory || t('character_sheet.export.not_applicable')}\n`;
    textContent += `${'='.repeat(35)}\n\n`;

    Object.entries(dynamicCharacterSheetFields).forEach(([sectionKey, fields]) => {
      const sectionName = t(characterSheetSections[sectionKey as keyof typeof characterSheetSections]);
      textContent += `--- ${sectionName.toUpperCase()} ---\n\n`;
      fields.forEach(field => {
        if (field.type !== 'display') {
          textContent += `${field.label}:\n${sheetData[field.id] || t('character_sheet.export.not_applicable')}\n\n`;
        }
      });
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name}_sheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: t('character_sheet.export.toast_success_title'), description: t('character_sheet.export.toast_success_desc', {name: character.name})});
  };


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('character_sheet.loading')}</p>
      </div>
    );
  }

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('character_sheet.no_active_story_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('character_sheet.no_active_story_desc_1')} <Link href="/stories" className="text-primary hover:underline">{t('character_sheet.no_active_story_desc_2')}</Link> {t('character_sheet.no_active_story_desc_3')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!character) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('character_sheet.not_found_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t('character_sheet.not_found_desc')}</p>
           <Button asChild variant="outline">
             <Link href="/characters"><ArrowLeft className="mr-2 h-4 w-4" />{t('character_sheet.back_to_characters')}</Link>
           </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <Button asChild variant="ghost" className="mb-2 -ml-4">
             <Link href="/characters"><ArrowLeft className="mr-2 h-4 w-4" />{t('character_sheet.back_to_characters')}</Link>
           </Button>
          <h1 className="text-4xl font-bold mb-1 flex items-center">
            <User className="mr-3 h-10 w-10 text-primary" /> {t('character_sheet.title')}: {character.name}
          </h1>
          <p className="text-muted-foreground">
            {t('character_sheet.save_notice')}
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSheet} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" /> {t('character_sheet.export_button')}
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('common.save')}
            </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['demographics', 'physicalAppearance']} className="w-full space-y-4">
        {Object.entries(dynamicCharacterSheetFields).map(([sectionKey, fields]) => (
          <AccordionItem key={sectionKey} value={sectionKey} className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6 text-xl hover:no-underline">
                {t(characterSheetSections[sectionKey as keyof typeof characterSheetSections])}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-6 p-6 pt-0">
                  {fields.map(field => (
                    <div key={field.id} className="grid gap-2">
                      <Label htmlFor={field.id}>{field.label}</Label>
                      {field.type === 'display' ? (
                        <Input id={field.id} readOnly value={character.name} className="bg-muted" />
                      ) : (
                        <Textarea
                          id={field.id}
                          value={sheetData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          rows={3}
                          placeholder={t('character_sheet.field_placeholder', { label: field.label.toLowerCase() })}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
