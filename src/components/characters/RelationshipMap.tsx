'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { CharacterProfile, CharacterRelationship } from '@/app/(app)/characters/page';
import { useLanguage } from '@/contexts/LanguageContext';

const REL_COLORS: Record<CharacterRelationship['type'], string> = {
  family:    '#6366f1',
  friend:    '#22c55e',
  enemy:     '#ef4444',
  romantic:  '#ec4899',
  mentor:    '#f59e0b',
  rival:     '#f97316',
  colleague: '#06b6d4',
  other:     '#94a3b8',
};

interface Props {
  characters: CharacterProfile[];
  onUpdateRelationships: (characterId: string, relationships: CharacterRelationship[]) => void;
}

export function RelationshipMap({ characters, onUpdateRelationships }: Props) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTarget, setAddTarget] = useState('');
  const [addType, setAddType] = useState<CharacterRelationship['type']>('friend');
  const [addLabel, setAddLabel] = useState('');

  const nodes = useMemo(() => {
    if (characters.length === 0) return [];
    const r = 160;
    const cx = 200, cy = 200;
    return characters.map((c, i) => {
      const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2;
      return { id: c.id, name: c.name, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }, [characters]);

  const edges = useMemo(() => {
    const result: Array<{ from: string; to: string; type: CharacterRelationship['type']; label?: string }> = [];
    const seen = new Set<string>();
    for (const c of characters) {
      for (const rel of c.relationships ?? []) {
        const key = [c.id, rel.targetId].sort().join('--');
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ from: c.id, to: rel.targetId, type: rel.type, label: rel.label });
        }
      }
    }
    return result;
  }, [characters]);

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const handleAddRelationship = () => {
    if (!selected || !addTarget) return;
    const char = characters.find(c => c.id === selected);
    if (!char) return;
    const existing = char.relationships ?? [];
    // Avoid duplicate
    if (existing.some(r => r.targetId === addTarget)) return;
    const newRel: CharacterRelationship = { targetId: addTarget, type: addType, label: addLabel || undefined };
    onUpdateRelationships(selected, [...existing, newRel]);
    // Mirror on the target too
    const target = characters.find(c => c.id === addTarget);
    if (target) {
      const targetExisting = target.relationships ?? [];
      if (!targetExisting.some(r => r.targetId === selected)) {
        onUpdateRelationships(addTarget, [...targetExisting, { targetId: selected, type: addType, label: addLabel || undefined }]);
      }
    }
    setAddDialogOpen(false);
    setAddTarget('');
    setAddLabel('');
  };

  const handleRemoveRelationship = (charId: string, targetId: string) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    onUpdateRelationships(charId, (char.relationships ?? []).filter(r => r.targetId !== targetId));
    // Remove mirror
    const target = characters.find(c => c.id === targetId);
    if (target) {
      onUpdateRelationships(targetId, (target.relationships ?? []).filter(r => r.targetId !== charId));
    }
  };

  if (characters.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">{t('rel_map.no_characters')}</p>;
  }

  const selectedChar = characters.find(c => c.id === selected);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <svg width="400" height="400" viewBox="0 0 400 400" className="mx-auto block max-w-full">
          {/* Edges */}
          {edges.map((e, i) => {
            const a = nodeMap.get(e.from);
            const b = nodeMap.get(e.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={REL_COLORS[e.type]} strokeWidth={2} strokeOpacity={0.7} />
                {e.label && (
                  <text x={mx} y={my - 4} textAnchor="middle" fontSize={9} fill={REL_COLORS[e.type]} className="pointer-events-none">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map(n => (
            <g key={n.id} onClick={() => setSelected(n.id === selected ? null : n.id)} className="cursor-pointer">
              <circle
                cx={n.x} cy={n.y} r={22}
                fill={n.id === selected ? 'hsl(var(--primary))' : 'hsl(var(--card))'}
                stroke={n.id === selected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={2}
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={10}
                fill={n.id === selected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                className="pointer-events-none font-medium"
              >
                {n.name.slice(0, 6)}
              </text>
              <text x={n.x} y={n.y + 34} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))" className="pointer-events-none">
                {n.name.slice(0, 12)}{n.name.length > 12 ? '…' : ''}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(REL_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {t(`rel_map.type_${type}` as never)}
          </span>
        ))}
      </div>

      {/* Selected character relationships */}
      {selectedChar && (
        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{selectedChar.name}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAddDialogOpen(true); setAddTarget(''); }}>
              <PlusCircle className="h-3 w-3 mr-1" />
              {t('rel_map.add_button')}
            </Button>
          </div>
          {(selectedChar.relationships ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('rel_map.no_relationships')}</p>
          ) : (
            <ul className="space-y-1">
              {(selectedChar.relationships ?? []).map(rel => {
                const target = characters.find(c => c.id === rel.targetId);
                if (!target) return null;
                return (
                  <li key={rel.targetId} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: REL_COLORS[rel.type] }} />
                      <span className="font-medium">{target.name}</span>
                      <span className="text-muted-foreground">· {t(`rel_map.type_${rel.type}` as never)}</span>
                      {rel.label && <span className="text-muted-foreground italic">({rel.label})</span>}
                    </span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveRelationship(selectedChar.id, rel.targetId)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {!selected && (
        <p className="text-xs text-muted-foreground text-center">{t('rel_map.click_hint')}</p>
      )}

      {/* Add relationship dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rel_map.add_title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('rel_map.target_label')}</Label>
              <Select value={addTarget} onValueChange={setAddTarget}>
                <SelectTrigger>
                  <SelectValue placeholder={t('rel_map.target_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {characters.filter(c => c.id !== selected).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('rel_map.type_label')}</Label>
              <Select value={addType} onValueChange={v => setAddType(v as CharacterRelationship['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REL_COLORS) as CharacterRelationship['type'][]).map(type => (
                    <SelectItem key={type} value={type}>{t(`rel_map.type_${type}` as never)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('rel_map.label_label')}</Label>
              <Input value={addLabel} onChange={e => setAddLabel(e.target.value)} placeholder={t('rel_map.label_placeholder')} className="h-8" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t('common.cancel')}</Button></DialogClose>
            <Button onClick={handleAddRelationship} disabled={!addTarget}>{t('rel_map.add_confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
