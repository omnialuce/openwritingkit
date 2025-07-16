
// src/app/characters/[characterId]/page.tsx
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
import { ArrowLeft, User, Save, Loader2, AlertTriangle } from 'lucide-react';
import { useStoryContext, getCharactersStorageKey, getCharacterSheetStorageKey, type CharacterProfile } from '@/contexts/StoryContext';
import { useToast } from '@/hooks/use-toast';
import useAutosave from '@/hooks/useAutosave';

const characterSheetSections = {
  demographics: [
    { id: 'name', label: 'Name (from profile)', type: 'display' },
    { id: 'age', label: 'Age' },
    { id: 'sexGender', label: 'Sex/Gender' },
    { id: 'ethnicity', label: 'Ethnicity' },
    { id: 'occupation', label: 'Occupation' },
    { id: 'socioeconomicStatus', label: 'Socioeconomic Status' },
    { id: 'education', label: 'Education' },
    { id: 'demographicsNotes', label: 'Other Notes' },
  ],
  physicalAppearance: [
    { id: 'eyeColor', label: 'Eye Color' },
    { id: 'skinColor', label: 'Skin Color' },
    { id: 'hairColor', label: 'Hair Color' },
    { id: 'height', label: 'Height' },
    { id: 'weight', label: 'Weight' },
    { id: 'bodyType', label: 'Body Type' },
    { id: 'fitnessLevel', label: 'Fitness Level' },
    { id: 'tattoos', label: 'Tattoos' },
    { id: 'scarsBirthmarks', label: 'Scars/Birthmarks' },
    { id: 'distinguishingFeatures', label: 'Other Distinguishing Features' },
    { id: 'disabilities', label: 'Disabilities' },
    { id: 'fashionStyle', label: 'Fashion Style' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'grooming', label: 'Cleanliness/Grooming' },
    { id: 'postureGait', label: 'Posture/Gait' },
    { id: 'tics', label: 'Tics' },
    { id: 'coordination', label: 'Coordination (or lack thereof)' },
    { id: 'weaknesses', label: 'Physical Weaknesses' },
    { id: 'physicalAppearanceNotes', label: 'Other Notes' },
  ],
  history: [
    { id: 'birthDate', label: 'Birth Date' },
    { id: 'placeOfBirth', label: 'Place of Birth' },
    { id: 'familyMembers', label: 'Key Family Members' },
    { id: 'notableEvents', label: 'Notable Events/Milestones' },
    { id: 'criminalRecord', label: 'Criminal Record' },
    { id: 'affiliations', label: 'Affiliations' },
    { id: 'skeletons', label: 'Skeletons in the Closet' },
    { id: 'historyNotes', label: 'Other Notes' },
  ],
  psychologicalTraits: [
    { id: 'personalityType', label: 'Personality Type (e.g., Myers-Briggs)' },
    { id: 'traits', label: 'Personality Traits' },
    { id: 'temperament', label: 'Temperament' },
    { id: 'introvertExtrovert', label: 'Introvert/Extrovert' },
    { id: 'mannerisms', label: 'Mannerisms' },
    { id: 'hobbies', label: 'Hobbies' },
    { id: 'skills', label: 'Skills/Talents' },
    { id: 'loves', label: 'Loves' },
    { id: 'morals', label: 'Morals/Virtues' },
    { id: 'phobias', label: 'Phobias/Fears' },
    { id: 'angeredBy', label: 'Angered By' },
    { id: 'petPeeves', label: 'Pet Peeves' },
    { id: 'obsessedWith', label: 'Obsessed With' },
    { id: 'routines', label: 'Routines' },
    { id: 'badHabits', label: 'Bad Habits' },
    { id: 'desires', label: 'Desires' },
    { id: 'flaws', label: 'Flaws' },
    { id: 'quirks', label: 'Quirks' },
    { id: 'favoriteSayings', label: 'Favorite Sayings' },
    { id: 'secrets', label: 'Secrets' },
    { id: 'regrets', label: 'Regrets' },
    { id: 'accomplishments', label: 'Accomplishments' },
    { id: 'memories', label: 'Memories' },
    { id: 'psychologicalNotes', label: 'Other Notes' },
  ],
  communication: [
    { id: 'languages', label: 'Languages Known' },
    { id: 'commMethods', label: 'Preferred Communication Methods' },
    { id: 'accent', label: 'Accent' },
    { id: 'speechStyle', label: 'Style and Pacing of Speech' },
    { id: 'pitch', label: 'Pitch' },
    { id: 'laughter', label: 'Laughter' },
    { id: 'smile', label: 'Smile' },
    { id: 'gestures', label: 'Use of Gestures' },
    { id: 'facialExpressions', label: 'Facial Expressions' },
    { id: 'verbalExpressions', label: 'Verbal Expressions' },
    { id: 'communicationNotes', label: 'Other Notes' },
  ],
  strengthsWeaknessesAbilities: [
    { id: 'physicalStrengths', label: 'Physical Strengths' },
    { id: 'physicalWeaknesses', label: 'Physical Weaknesses' },
    { id: 'intellectualStrengths', label: 'Intellectual Strengths' },
    { id: 'intellectualWeaknesses', label: 'Intellectual Weaknesses' },
    { id: 'interpersonalStrengths', label: 'Interpersonal Strengths' },
    { id: 'interpersonalWeaknesses', label: 'Interpersonal Weaknesses' },
    { id: 'abilities', label: 'Physical/Magical Abilities' },
    { id: 'physicalConditions', label: 'Physical Illnesses/Conditions' },
    { id: 'mentalConditions', label: 'Mental Illnesses/Conditions' },
    { id: 'swaNotes', label: 'Other Notes' },
  ],
  relationships: [
    { id: 'partners', label: 'Partner(s)/Significant Other(s)' },
    { id: 'family', label: 'Family (Parents, Children, etc.)' },
    { id: 'friends', label: 'Friends & Best Friends' },
    { id: 'rivalsEnemies', label: 'Rivals & Enemies' },
    { id: 'colleagues', label: 'Colleagues & Mentors' },
    { id: 'socialMedia', label: 'Social Media Presence' },
    { id: 'publicPerception', label: 'Public Perception' },
    { id: 'relationshipNotes', label: 'Other Notes' },
  ],
  characterGrowth: [
    { id: 'archetype', label: 'Character Archetype' },
    { id: 'arc', label: 'Character Arc' },
    { id: 'coreValues', label: 'Core Values' },
    { id: 'internalConflicts', label: 'Internal Conflicts' },
    { id: 'externalConflicts', label: 'External Conflicts' },
    { id: 'goals', label: 'Goals' },
    { id: 'motivations', label: 'Motivations' },
    { id: 'epiphanies', label: 'Epiphanies' },
    { id: 'significantEvents', label: 'Significant Events/Plot Points' },
    { id: 'growthNotes', label: 'Other Notes' },
  ],
};

type SheetData = {
  [key: string]: string;
};

export default function CharacterSheetPage() {
  const params = useParams();
  const characterId = params.characterId as string;
  const { activeStoryId } = useStoryContext();
  const { toast } = useToast();
  
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const sheetStorageKey = useMemo(() => getCharacterSheetStorageKey(activeStoryId, characterId), [activeStoryId, characterId]);
  
  const [savedContent, setSavedContent, isSaving, , lastSavedTime] = useAutosave<string>(sheetStorageKey, '{}');
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getCharactersStorageKey(activeStoryId);
      const storedCharacters = localStorage.getItem(storageKey);
      if (storedCharacters) {
        const chars: CharacterProfile[] = JSON.parse(storedCharacters);
        const foundChar = chars.find(c => c.id === characterId);
        if (foundChar) {
          setCharacter(foundChar);
        } else {
          setCharacter(null); // Character not found
        }
      }
    }
  }, [activeStoryId, characterId]);

  useEffect(() => {
    if(isMounted) {
      try {
        const parsedData = JSON.parse(savedContent);
        setSheetData(parsedData);
      } catch (e) {
        setSheetData({});
      }
    }
  }, [savedContent, isMounted]);

  const handleFieldChange = (fieldId: string, value: string) => {
    const newData = { ...sheetData, [fieldId]: value };
    setSheetData(newData);
    setSavedContent(JSON.stringify(newData));
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading character sheet...</p>
      </div>
    );
  }

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a story from the <Link href="/stories" className="text-primary hover:underline">Stories page</Link> to view character sheets.</p>
        </CardContent>
      </Card>
    );
  }

  if (!character) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Character Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">The character you are looking for does not exist in the active story.</p>
           <Button asChild variant="outline">
             <Link href="/characters"><ArrowLeft className="mr-2 h-4 w-4" />Back to Characters</Link>
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
             <Link href="/characters"><ArrowLeft className="mr-2 h-4 w-4" />Back to All Characters</Link>
           </Button>
          <h1 className="text-4xl font-bold mb-1 flex items-center">
            <User className="mr-3 h-10 w-10 text-primary" /> Character Sheet: {character.name}
          </h1>
          <p className="text-muted-foreground">
            All changes are saved automatically. Last saved: {lastSavedTime ? lastSavedTime.toLocaleTimeString() : 'N/A'}
            {isSaving && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
          </p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['demographics', 'physicalAppearance']} className="w-full space-y-4">
        {Object.entries(characterSheetSections).map(([sectionKey, fields]) => (
          <AccordionItem key={sectionKey} value={sectionKey} className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6 text-xl hover:no-underline">
                {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
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
                          placeholder={`Details about ${field.label.toLowerCase()}...`}
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

