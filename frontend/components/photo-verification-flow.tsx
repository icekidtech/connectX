'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Upload,
  XCircle,
  FileText,
  Image,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PhotoVerificationFlow() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'photo' | 'id' | 'review' | 'complete'>(
    'intro'
  );
  const [photoVerified, setPhotoVerified] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
          <p className="text-muted-foreground">
            Verify your identity to unlock premium features and build trust in the community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  currentStep !== 'intro'
                    ? 'bg-green-500 text-white'
                    : 'bg-accent text-white'
                }`}
              >
                ✓
              </div>
              <span className="text-sm font-medium">Start</span>
            </div>

            <div className="flex-1 h-1 bg-border/50 mx-2"></div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                photoVerified ? 'bg-green-500 text-white' : 'bg-border text-muted-foreground'
              }`}
            >
              {photoVerified ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium">Photo</span>

            <div className="flex-1 h-1 bg-border/50 mx-2"></div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                idVerified ? 'bg-green-500 text-white' : 'bg-border text-muted-foreground'
              }`}
            >
              {idVerified ? '✓' : '2'}
            </div>
            <span className="text-sm font-medium">ID</span>

            <div className="flex-1 h-1 bg-border/50 mx-2"></div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                photoVerified && idVerified ? 'bg-green-500 text-white' : 'bg-border text-muted-foreground'
              }`}
            >
              ✓
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        {/* Content Based on Step */}
        {currentStep === 'intro' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 mb-4 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">Photo Verification</CardTitle>
                  <CardDescription>
                    Verify with a clear selfie photo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Takes 2-3 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Results within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>100% secure and private</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 mb-4 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">ID Verification</CardTitle>
                  <CardDescription>
                    Verify with a government-issued ID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Takes 3-5 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Results within 48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Encrypted and deleted after</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Your privacy is protected</AlertTitle>
              <AlertDescription>
                We use industry-leading encryption and never store raw identification data. All
                verification is handled by third-party providers who specialize in identity
                security.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setCurrentStep('photo')}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Start Verification
            </Button>
          </div>
        )}

        {currentStep === 'photo' && (
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Selfie Photo Verification</CardTitle>
                <CardDescription>
                  Take a clear selfie photo for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Camera Preview */}
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-dashed border-border flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Camera preview area</p>
                    <Button variant="outline" className="gap-2">
                      <Camera className="w-4 h-4" />
                      Open Camera
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-200/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Photo Tips</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Make sure your face is clearly visible</li>
                    <li>• Use good lighting (natural light is best)</li>
                    <li>• Look directly at the camera</li>
                    <li>• No filters, hats, or sunglasses</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep('intro')}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={() => {
                      setPhotoVerified(true);
                      setCurrentStep('id');
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'id' && (
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Government ID Verification</CardTitle>
                <CardDescription>
                  Upload photos of your government-issued ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ID Upload Areas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-dashed border-border flex items-center justify-center p-4">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Front</p>
                      <Button variant="outline" size="sm" className="gap-2 mt-2">
                        <Upload className="w-3 h-3" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-dashed border-border flex items-center justify-center p-4">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Back</p>
                      <Button variant="outline" size="sm" className="gap-2 mt-2">
                        <Upload className="w-3 h-3" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Accepted Documents */}
                <div className="bg-green-500/10 border border-green-200/50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Accepted Documents</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Passport</li>
                    <li>• Driver's License</li>
                    <li>• National ID Card</li>
                    <li>• Visa or Travel Document</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCurrentStep('photo')}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={() => {
                      setIdVerified(true);
                      setCurrentStep('review');
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'review' && photoVerified && idVerified && (
          <div className="space-y-6">
            <Alert className="border-green-200/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Ready to submit</AlertTitle>
              <AlertDescription className="text-green-800">
                Your verification information has been confirmed and is ready to submit. Our team
                will review it within 24-48 hours.
              </AlertDescription>
            </Alert>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Verification Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-green-200/50 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Photo Verification</span>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">Ready</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-green-200/50 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">ID Verification</span>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">Ready</Badge>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                After submission, our verification team will review your documents. You'll
                receive an email notification once verification is complete. This typically takes
                24-48 hours.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setCurrentStep('complete')}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Submit Verification
            </Button>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Submitted</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for submitting your verification. Our team will review your documents
                and you'll receive an email notification within 24-48 hours.
              </p>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>What You Can Do Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Continue Using ConnectX</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is fully functional while verification is being reviewed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a notification once verification is complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-accent hover:bg-accent/90"
              onClick={() => setCurrentStep('intro')}
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
