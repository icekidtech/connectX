'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Radio, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GoLivePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isNsfw: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title.trim()) {
      setError('Please enter a stream title');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const stream = await response.json();
      router.push(`/dashboard/streams/${stream.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <Link href="/dashboard/streams" className="inline-flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Streams
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Radio className="w-8 h-8 text-accent" />
            Go Live
          </h1>
          <p className="text-muted-foreground">
            Start streaming and connect with your audience in real-time
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <CardTitle>Stream Details</CardTitle>
              <CardDescription>
                Fill in the information about your stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-semibold">
                    Stream Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="What are you streaming about?"
                    value={formData.title}
                    onChange={handleChange}
                    className="bg-input border-border"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-semibold">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell viewers more about your stream..."
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-input border-border min-h-24"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* NSFW Toggle */}
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold">Content Settings</Label>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card/50">
                    <Checkbox
                      id="isNsfw"
                      name="isNsfw"
                      checked={formData.isNsfw}
                      onChange={handleChange}
                    />
                    <Label htmlFor="isNsfw" className="cursor-pointer flex-1 text-foreground">
                      <span className="font-medium">Mark as NSFW/Adult Content</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        This stream contains adult or explicit content
                      </p>
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  {loading ? 'Starting Stream...' : 'Start Streaming'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tips Sidebar */}
          <div className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Stream Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Before You Go Live</p>
                  <ul className="space-y-2 text-muted-foreground text-xs">
                    <li>✓ Test your camera and microphone</li>
                    <li>✓ Ensure good lighting</li>
                    <li>✓ Check your internet connection</li>
                    <li>✓ Have a clear, engaging title</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Engagement Tips</p>
                  <ul className="space-y-2 text-muted-foreground text-xs">
                    <li>✓ Interact with viewers</li>
                    <li>✓ Respond to comments</li>
                    <li>✓ Keep content engaging</li>
                    <li>✓ Let people know what to expect</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Community Guidelines</p>
                  <p className="text-muted-foreground text-xs">
                    Please ensure your stream follows our community guidelines. Respectful and inclusive content only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
