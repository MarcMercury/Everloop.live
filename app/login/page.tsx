'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { login, signup, signInWithGoogle } from '@/lib/actions/auth'
import { Mail, Lock, User, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('login')
  
  // Check for redirect message
  const redirected = searchParams.get('redirected')
  
  const handleLogin = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      const result = await login(formData)
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
      // If successful, the server action will redirect
    })
  }
  
  const handleSignup = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      const result = await signup(formData)
      if (!result.success) {
        setError(result.error || 'Signup failed')
      } else {
        setSuccess(result.message || 'Account created!')
        setActiveTab('login')
      }
    })
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Back link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-light/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Logo */}
      <div className="mb-8 text-center relative z-10">
        <h1 className="text-4xl font-serif tracking-tight">
          <span className="text-parchment">Ever</span>
          <span className="canon-text">loop</span>
        </h1>
        <p className="text-parchment-muted mt-2">Enter the universe</p>
      </div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center pb-4">
          <CardTitle className="font-serif text-2xl">Welcome</CardTitle>
          <CardDescription className="text-parchment-muted">
            Sign in to write your story in the Everloop
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Redirect notice */}
          {redirected && (
            <div className="mb-4 p-3 rounded-md bg-gold/10 border border-gold/30 text-sm text-gold">
              Please sign in to access that page.
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {error}
            </div>
          )}
          
          {/* Success display */}
          {success && (
            <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-sm text-green-400 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Google OAuth */}
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="w-full mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
          
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form action={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="writer@everloop.live"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="canon"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              <form action={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="chronicler_of_virelay"
                      required
                      minLength={3}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your public identity in the Everloop.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="writer@everloop.live"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  variant="canon"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground text-center">
        By signing in, you agree to contribute to the shared canon.
      </p>
    </div>
  )
}
