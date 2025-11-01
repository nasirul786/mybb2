"use client"

import type React from "react"
import { useState, useEffect, Suspense, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, Loader2, Eye, EyeOff, Send, Mail, CheckCircle2 } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const API_KEY_STORAGE_KEY = process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY || "bb_api_key"
const USER_STORAGE_KEY = `${API_KEY_STORAGE_KEY}_user`
const THEME_STORAGE_KEY = process.env.NEXT_PUBLIC_THEME_KEY || "THEME"

const apiUrl = (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`


async function apiFetchNoAuth(path: string, options: RequestInit = {}) {
  const url = apiUrl(path)
  const res = await fetch(url, { cache: "no-store", ...options })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let errorMsg = text || `HTTP ${res.status}`
    try {
      const json = JSON.parse(text)
      errorMsg = json?.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }
  return res
}



function useThemeBoot() {
  useEffect(() => {
    const getPref = () => localStorage.getItem(THEME_STORAGE_KEY) || "system"
    const apply = (m: "light" | "dark") => {
      if (m === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
    }
    const pref = getPref()
    if (pref === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mql.matches ? "dark" : "light")
      const onChange = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light")
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    } else {
      apply(pref === "dark" ? "dark" : "light")
    }
  }, [])
}

function AuthWelcomePanel({ mode }: { mode: "login" | "new" | "apikey" | "forgot" }) {
  const [welcomeAnim, setWelcomeAnim] = useState<any>(null)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/lottie/welcome.json")
        const data = await res.json()
        if (!cancelled) setWelcomeAnim(data)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])
  const head = mode === "login" ? "Welcome back" : mode === "new" ? "Welcome" : mode === "apikey" ? "API Key Sign In" : "Reset Password"
  const sub = mode === "login" ? "Sign in to continue" : mode === "new" ? "Create your account" : mode === "apikey" ? "Connect using your key" : "Enter your email to reset"
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center p-10 text-center smoky-blue">
      <div className="w-[28rem] h-[28rem] max-w-full">
        {welcomeAnim && <Lottie animationData={welcomeAnim} loop autoplay className="w-full h-full" />}
      </div>
      <div className="mt-4 space-y-2">
        <h1 className="welcome-heading text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {head}
        </h1>
        <p className="text-base text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function MobileWelcome({ mode }: { mode: "login" | "new" | "apikey" | "forgot" }) {
 const head = mode === "login" ? "Welcome back" : mode === "new" ? "Welcome" : mode === "apikey" ? "API Key Sign In" : "Reset Password"
 const sub = mode === "login" ? "Sign in to continue" : mode === "new" ? "Create your account" : mode === "apikey" ? "Connect using your key" : "Enter your email to reset"
  return (
    <div className="lg:hidden flex flex-col items-center justify-center gap-2 mb-6">
      <h1 className="welcome-heading text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {head}
      </h1>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  )
}

function AuthPageContent() {
  useThemeBoot()
  const navigate = (path: string) => { window.location.href = path }
  const [mode, setMode] = useState<"login" | "new" | "apikey" | "forgot">("login")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get("mode")
    if (modeParam && ["login", "new", "apikey", "forgot"].includes(modeParam)) setMode(modeParam as typeof mode)
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [tgModalOpen, setTgModalOpen] = useState(false)
  const [tgLoading, setTgLoading] = useState(false)
  const [tgError, setTgError] = useState("")
  const [tgLink, setTgLink] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedApiKey) navigate("/app/bots")
  }, [navigate])

  const getApiKeyAndLogin = useCallback(async (authHeaders: Headers) => {
    try {
      const accessToken = authHeaders.get("access-token")
      const client = authHeaders.get("client")
      const uid = authHeaders.get("uid")
      if (!accessToken || !client || !uid) throw new Error("Authentication headers are missing.")
      const response = await fetch(apiUrl("/user"), { headers: { "access-token": accessToken, client, uid } })
      const data = await response.json()
      if (!response.ok || !data.api_key) throw new Error(data.errors?.join(", ") || "Failed to retrieve API key.")
      localStorage.setItem(API_KEY_STORAGE_KEY, data.api_key)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
      navigate("/app/bots")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred getting API Key.")
      setLoading(false)
      setTgLoading(false)
      setTgModalOpen(false)
    }
  }, [navigate])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Please enter both email and password."); return }
    setLoading(true)
    setError("")
    setResetSuccess("")
    try {
      const response = await fetch(apiUrl("/auth/sign_in"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })

      if (response.status === 401) {
        throw new Error("Invalid login credentials.")
      }

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.errors?.join(", ") || `Login failed. Status: ${response.status}`)
      }

      if (data?.errors) {
        throw new Error(data.errors.join(", "))
      }

      await getApiKeyAndLogin(response.headers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in.")
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) { setError("Passwords do not match."); return }
    if (!agreeToTerms) { setError("You must agree to the terms of service."); return }
    setLoading(true)
    setError("")
    setResetSuccess("")
    try {
      const response = await fetch(apiUrl("/auth"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation }) })
      const data = await response.json()
      if (!response.ok || data.errors) throw new Error(data.errors?.full_messages?.join(", ") || data.errors?.join(", ") || "Registration failed.")
      await getApiKeyAndLogin(response.headers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register.")
      setLoading(false)
    }
  }

  const handleApiKeyLogin = async (keyToUse: string) => {
    if (!keyToUse.trim()) { setError("Please enter your API key"); return }
    setLoading(true)
    setError("")
    setResetSuccess("")
    try {
      const response = await fetch(apiUrl(`/user?api_key=${encodeURIComponent(keyToUse)}`))
      const data = await response.json()
      if (!response.ok || data.errors) throw new Error("Invalid API key. Please check and try again.")
      localStorage.setItem(API_KEY_STORAGE_KEY, keyToUse)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
      navigate("/app/bots")
    } catch {
      setError("Failed to connect. Please check your API key.")
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("Please enter your email address."); return }
    setLoading(true)
    setError("")
    setResetSuccess("")
    try {
      const res = await apiFetchNoAuth("/user/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}));
      if (data?.result === "ok") {
        setResetSuccess("New password has been sent to your email address, please check and use it to log in.")
        setEmail("")
      } else {
         throw new Error("Failed to send reset email. Please check the email address or try again later.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset password email.")
    } finally {
      setLoading(false)
    }
  }

  const pollTgStatus = useCallback(async (secret: string) => {
    try {
      while (true) {
        const response = await fetch(apiUrl(`/tg_sign_in/${secret}`))
        const data = await response.json()
        if (data.status === "SIGNED_IN") { await getApiKeyAndLogin(response.headers); setTgModalOpen(false); return }
        if (data.status !== "PENDING") throw new Error(data.message || "Login expired. Please try again.")
        await delay(data.poll_after_ms || 1500)
      }
    } catch (err) {
      setTgError(err instanceof Error ? err.message : "Login failed or expired.")
      setTgLoading(false)
    }
  }, [getApiKeyAndLogin])

  const handleTelegramLogin = useCallback(async () => {
    setTgLoading(true)
    setTgError("")
    setTgModalOpen(true)
    setError("")
    setResetSuccess("")
    try {
      const response = await fetch(apiUrl("/tg_sign_in"), { method: "POST" })
      const data = await response.json()
      if (!response.ok || !data.link || !data.secret) throw new Error("Failed to initialize Telegram login.")
      setTgLink(data.link)
      setTgLoading(false)
      window.open(data.link, "_blank")
      await pollTgStatus(data.secret)
    } catch (err) {
      setTgError(err instanceof Error ? err.message : "An unknown error occurred.")
      setTgLoading(false)
    }
  }, [pollTgStatus])


  const ErrorMessage = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive">{text}</p>
    </div>
  )

   const SuccessMessage = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      <p className="text-sm text-green-700 dark:text-green-400">{text}</p>
    </div>
  )


  const renderLoginForm = () => (
    <>
      <h2 className="sr-only">Login</h2>
       {resetSuccess && <SuccessMessage text={resetSuccess} />}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium mb-2">Email</label>
          <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required autoComplete="email" />
        </div>
        <div>
          <div className="flex justify-between items-baseline mb-2">
             <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
             <a href="/app?mode=forgot" className="text-xs text-primary hover:underline font-medium">Forgot Password?</a>
          </div>
          <div className="relative">
            <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" required autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <ErrorMessage text={error} />}
        <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}</Button>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        <Button type="button" variant="outline" disabled={loading} onClick={handleTelegramLogin} className="w-full">
          <Send className="w-4 h-4 mr-2" /> Sign in with Telegram
        </Button>
      </form>
      <div className="mt-6 text-xs text-muted-foreground text-center space-y-2">
        <p>Don’t have an account? <a href="/app?mode=new" className="text-primary hover:underline font-medium">Create one</a></p>
        <p>Prefer a key? <a href="/app?mode=apikey" className="text-primary hover:underline font-medium">Use API Key</a></p>
      </div>
    </>
  )

  const renderRegisterForm = () => (
    <>
      <h2 className="sr-only">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email</label>
          <Input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-2">Confirm Password</label>
          <div className="relative">
            <Input id="register-confirm-password" type={showPasswordConfirmation ? "text" : "password"} placeholder="••••••••" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} disabled={loading} className="pr-10" required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPasswordConfirmation ? "Hide confirmation password" : "Show confirmation password"}>
              {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} disabled={loading} className="mt-0.5" />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="terms" className="text-sm font-medium text-muted-foreground cursor-pointer">I agree to the <a href="https://bots.business/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a></label>
          </div>
        </div>
        {error && <ErrorMessage text={error} />}
        <Button type="submit" disabled={loading || !agreeToTerms} className="w-full">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Account"}</Button>
      </form>
      <div className="mt-6 text-xs text-muted-foreground text-center">
        <p>Already have an account? <a href="/app?mode=login" className="text-primary hover:underline font-medium">Sign In</a></p>
      </div>
    </>
  )

  const renderApiKeyForm = () => (
    <>
      <h2 className="sr-only">API Key</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleApiKeyLogin(apiKey) }} className="space-y-4">
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium mb-2">API Key</label>
          <Input id="api-key-input" type="text" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} />
          <p className="text-xs text-muted-foreground mt-2">Your API key is stored locally in your browser.</p>
        </div>
        {error && <ErrorMessage text={error} />}
        <Button type="submit" disabled={loading} className="w-full">{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In with API Key"}</Button>
      </form>
      <div className="mt-6 text-xs text-muted-foreground text-center space-y-2">
        <p>Don’t have a key? <a href="https://bots.business" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Get one</a></p>
        <p><a href="/app?mode=login" className="text-primary hover:underline font-medium">Use Email/Password</a></p>
      </div>
    </>
  )

  const renderForgotForm = () => (
    <>
      <h2 className="sr-only">Forgot Password</h2>
      {resetSuccess && <SuccessMessage text={resetSuccess} />}
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium mb-2">Email Address</label>
           <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="forgot-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required autoComplete="email" className="pl-10" />
            </div>
          <p className="text-xs text-muted-foreground mt-2">Enter the email associated with your account.</p>
        </div>
        {error && <ErrorMessage text={error} />}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Reset Password"}
        </Button>
      </form>
      <div className="mt-6 text-xs text-muted-foreground text-center">
        <p>Remember your password? <a href="/app?mode=login" className="text-primary hover:underline font-medium">Sign In</a></p>
      </div>
    </>
  )

  const renderTelegramModal = () => (
    <Dialog open={tgModalOpen} onOpenChange={setTgModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in with Telegram</DialogTitle>
          <DialogDescription>Please confirm the login request in your Telegram app.</DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          {tgLoading && <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />}
          {!tgLoading && !tgError && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Waiting for confirmation...</p>
              {tgLink && <a href={tgLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs font-medium">Click here if you weren’t redirected</a>}
            </div>
          )}
          {tgError && <p className="text-sm text-destructive mt-4">{tgError}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <main className="auth-stage min-h-screen w-full lg:grid lg:grid-cols-2">
      <AuthWelcomePanel mode={mode} />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <MobileWelcome mode={mode} />
          <Card className="p-8 soft-card elevated">
            {mode === "login" && renderLoginForm()}
            {mode === "new" && renderRegisterForm()}
            {mode === "apikey" && renderApiKeyForm()}
            {mode === "forgot" && renderForgotForm()}
          </Card>
        </div>
      </div>
      {renderTelegramModal()}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthPageContent />
    </Suspense>
  )
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}