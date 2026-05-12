'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PreferenceEditorProps {
  onSave?: (preferences: any) => void;
}

export function PreferenceEditor({ onSave }: PreferenceEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ageRange, setAgeRange] = useState({ min: 20, max: 50 });
  const [distance, setDistance] = useState(50);
  const [lookingFor, setLookingFor] = useState<string[]>(['dating']);
  const [isSaving, setIsSaving] = useState(false);

  const relationshipTypes = [
    'dating',
    'hookups',
    'relationships',
    'long-term',
    'short-term',
    'bdsm',
    'friends',
  ];

  const handleToggleType = (type: string) => {
    setLookingFor((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ageRange,
          distance,
          lookingFor,
        }),
      });
      onSave?.({ ageRange, distance, lookingFor });
      setIsOpen(false);
    } catch (error) {
      console.error('[v0] Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-between border-primary/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Matching Preferences</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-4 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Customize Your Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range */}
            <div>
              <label className="font-semibold text-foreground mb-3 block">
                Age Range: {ageRange.min} - {ageRange.max}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={ageRange.min}
                  onChange={(e) =>
                    setAgeRange((prev) => ({
                      ...prev,
                      min: Math.min(Number(e.target.value), prev.max),
                    }))
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={ageRange.max}
                  onChange={(e) =>
                    setAgeRange((prev) => ({
                      ...prev,
                      max: Math.max(Number(e.target.value), prev.min),
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="font-semibold text-foreground mb-3 block">
                Distance: Up to {distance} km
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Looking For */}
            <div>
              <label className="font-semibold text-foreground mb-3 block">Looking For</label>
              <div className="grid grid-cols-2 gap-2">
                {relationshipTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleToggleType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                      lookingFor.includes(type)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
