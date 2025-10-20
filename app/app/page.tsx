"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertCircle, Loader2, Eye, EyeOff, Send } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function useThemeBoot() {
  useEffect(() => {
    const getPref = () =>
      localStorage.getItem("theme") ||
      localStorage.getItem("mybb_theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "system"
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

function AuthWelcomePanel({ mode }: { mode: "login" | "new" | "apikey" }) {
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
  const head = mode === "login" ? "Welcome back" : mode === "new" ? "Welcome" : "API Key Sign In"
  const sub = mode === "login" ? "Sign in to continue" : mode === "new" ? "Create your account" : "Connect using your key"
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

function MobileWelcome({ mode }: { mode: "login" | "new" | "apikey" }) {
  const head = mode === "login" ? "Welcome back" : mode === "new" ? "Welcome" : "API Key Sign In"
  const sub = mode === "login" ? "Sign in to continue" : mode === "new" ? "Create your account" : "Connect using your key"
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
  const [mode, setMode] = useState<"login" | "new" | "apikey">("login")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get("mode")
    if (modeParam && ["login", "new", "apikey"].includes(modeParam)) setMode(modeParam as typeof mode)
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
  useEffect(() => {
    const storedApiKey = localStorage.getItem("mybb_api_key")
    if (storedApiKey) navigate("/app/bots")
  }, [])
  const getApiKeyAndLogin = async (authHeaders: Headers) => {
    try {
      const accessToken = authHeaders.get("access-token")
      const client = authHeaders.get("client")
      const uid = authHeaders.get("uid")
      if (!accessToken || !client || !uid) throw new Error("Authentication headers are missing.")
      const response = await fetch("https://appapi.bots.business/v2/user", { headers: { "access-token": accessToken, client, uid } })
      const data = await response.json()
      if (!response.ok || !data.api_key) throw new Error(data.errors?.join(", ") || "Failed to retrieve API key.")
      localStorage.setItem("mybb_api_key", data.api_key)
      localStorage.setItem("mybb_user", JSON.stringify(data))
      navigate("/app/bots")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      setLoading(false)
      setTgLoading(false)
      setTgModalOpen(false)
    }
  }
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError("Please enter both email and password."); return }
    setLoading(true)
    setError("")
    try {
      const response = await fetch("https://appapi.bots.business/v2/auth/sign_in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      const data = await response.json()
      if (!response.ok || data.errors) throw new Error(data.errors?.join(", ") || "Invalid login credentials.")
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
    try {
      const response = await fetch("https://appapi.bots.business/v2/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation }) })
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
    try {
      const response = await fetch(`https://appapi.bots.business/v2/user?api_key=${encodeURIComponent(keyToUse)}`)
      const data = await response.json()
      if (!response.ok || data.errors) throw new Error("Invalid API key. Please check and try again.")
      localStorage.setItem("mybb_api_key", keyToUse)
      localStorage.setItem("mybb_user", JSON.stringify(data))
      navigate("/app/bots")
    } catch {
      setError("Failed to connect. Please check your API key.")
      setLoading(false)
    }
  }
  const handleTelegramLogin = async () => {
    setTgLoading(true)
    setTgError("")
    setTgModalOpen(true)
    setError("")
    try {
      const response = await fetch("https://appapi.bots.business/v2/tg_sign_in", { method: "POST" })
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
  }
  const pollTgStatus = async (secret: string) => {
    try {
      while (true) {
        const response = await fetch(`https://appapi.bots.business/v2/tg_sign_in/${secret}`)
        const data = await response.json()
        if (data.status === "SIGNED_IN") { await getApiKeyAndLogin(response.headers); setTgModalOpen(false); return }
        if (data.status !== "PENDING") throw new Error(data.message || "Login expired. Please try again.")
        await delay(data.poll_after_ms || 1500)
      }
    } catch (err) {
      setTgError(err instanceof Error ? err.message : "Login failed or expired.")
      setTgLoading(false)
    }
  }
  const ErrorMessage = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive">{text}</p>
    </div>
  )
  const renderLoginForm = () => (
    <>
      <h2 className="sr-only">Login</h2>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <ErrorMessage text={error} />}
        <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}</Button>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
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
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="pr-10" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <div className="relative">
            <Input type={showPasswordConfirmation ? "text" : "password"} placeholder="••••••••" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} disabled={loading} className="pr-10" required />
            <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground transition-colors">
              {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} disabled={loading} className="mt-0.5" />
          <div className="grid gap-1.5 leading-none">
            <label htmlFor="terms" className="text-sm font-medium text-muted-foreground">I agree to the <a href="https://bots.business/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a></label>
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
          <label className="block text-sm font-medium mb-2">API Key</label>
          <Input type="text" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} />
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
