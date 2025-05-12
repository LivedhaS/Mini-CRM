'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const checkGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleScriptLoaded(true);
        initializeGoogleSignIn();
      }
    };

    // Check immediately
    checkGoogleScript();

    // Also check after a short delay to ensure script is loaded
    const timeoutId = setTimeout(checkGoogleScript, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const initializeGoogleSignIn = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            await signIn(response.credential);
            toast({
              title: "Success",
              description: "Successfully signed in with Google",
            });
          } catch (error) {
            console.error('Sign in failed:', error);
            toast({
              title: "Error",
              description: "Failed to sign in with Google",
              variant: "destructive",
            });
          }
        },
      });

      const buttonElement = document.getElementById('googleSignIn');
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: 250,
        });
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Google Sign-In",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to Mini CRM</CardTitle>
          <CardDescription>
            A modern CRM platform with customer segmentation and campaign management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Features</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Customer Segmentation</li>
              <li>Campaign Management</li>
              <li>AI-Powered Insights</li>
              <li>Real-time Analytics</li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div id="googleSignIn" />
            {!isGoogleScriptLoaded && (
              <p className="text-sm text-muted-foreground">
                Loading Google Sign-In...
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Sign in with your Google account to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 