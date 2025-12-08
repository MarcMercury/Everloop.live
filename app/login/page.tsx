'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { login, signup } from '@/lib/actions/auth'
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
