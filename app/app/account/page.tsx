"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, Loader2, LogOut, Link as LinkIcon, RefreshCcw, Mail, Key, Calendar, Eye, EyeOff } from "lucide-react"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
type User = {
  id: number
  email: string
  created_at: string
  api_key: string
}
type LinkedAccount = {
  id: number
  first_name: string | null
  last_name: string | null
  username: string | null
  telegramid: number
  created_at: string
  language_code: string | null
}
type ToastType = "success" | "destructive"
export default function AccountPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [copyEmailOk, setCopyEmailOk] = useState(false)
  const [copyKeyOk, setCopyKeyOk] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [changingEmail, setChangingEmail] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [sessions, setSessions] = useState<string[] | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [linked, setLinked] = useState<LinkedAccount[] | null>(null)
  const [loadingLinked, setLoadingLinked] = useState(false)
  const [linkingNew, setLinkingNew] = useState(false)
  const [showResetKeyModal, setShowResetKeyModal] = useState(false)
  const [resettingKey, setResettingKey] = useState(false)
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false)
  const [loggingOutAll, setLoggingOutAll] = useState(false)
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>("success")
  const toastTimer = useRef<number | null>(null)
  const emailTimer = useRef<number | null>(null)
  const keyTimer = useRef<number | null>(null)
  const router = useRouter()
  function showToast(message: string, type: ToastType = "success") {
    setToastMessage(message)
    setToastType(type)
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }
    toastTimer.current = window.setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  useEffect(() => {
    try {
      const k = localStorage.getItem("mybb_api_key")
      if (!k) {
        window.location.href = "/app"
        return
      }
      setApiKey(k)
    } catch {
      window.location.href = "/app"
    }
  }, [])
  useEffect(() => {
    if (!apiKey) return
    ;(async () => {
      setLoadingUser(true)
      try {
        const res = await fetch(`https://appapi.bots.business/v2/user?api_key=${encodeURIComponent(apiKey)}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load user: ${res.status}`)
        const data: User = await res.json()
        setUser(data)
        setEmailInput(data.email)
      } catch (e: any) {
        showToast(`Failed to load account: ${e?.message ?? "Unknown error"}`, "destructive")
      } finally {
        setLoadingUser(false)
      }
    })()
  }, [apiKey])
  useEffect(() => {
    if (!apiKey) return
    ;(async () => {
      setLoadingSessions(true)
      try {
        const res = await fetch(`https://appapi.bots.business/v2/user/tokens?api_key=${encodeURIComponent(apiKey)}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`)
        const data: string[] = await res.json()
        setSessions(data)
      } catch (e: any) {
        showToast(`Failed to load sessions: ${e?.message ?? "Unknown error"}`, "destructive")
      } finally {
        setLoadingSessions(false)
      }
    })()
  }, [apiKey])
  useEffect(() => {
    if (!apiKey) return
    ;(async () => {
      setLoadingLinked(true)
      try {
        const res = await fetch(`https://appapi.bots.business/v2/user/linked_accounts?api_key=${encodeURIComponent(apiKey)}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load linked accounts: ${res.status}`)
        const data: LinkedAccount[] = await res.json()
        setLinked(data)
      } catch (e: any) {
        showToast(`Failed to load linked accounts: ${e?.message ?? "Unknown error"}`, "destructive")
      } finally {
        setLoadingLinked(false)
      }
    })()
  }, [apiKey])
  async function copyToClipboard(text: string, which: "email" | "key") {
    try {
      await navigator.clipboard.writeText(text)
      if (which === "email") {
        setCopyEmailOk(true)
        if (emailTimer.current) window.clearTimeout(emailTimer.current)
        emailTimer.current = window.setTimeout(() => setCopyEmailOk(false), 1200)
      } else {
        setCopyKeyOk(true)
        if (keyTimer.current) window.clearTimeout(keyTimer.current)
        keyTimer.current = window.setTimeout(() => setCopyKeyOk(false), 1200)
      }
    } catch {
      showToast("Copy failed: Clipboard is not available", "destructive")
    }
  }
  async function submitEmailChange() {
    if (!emailInput || !apiKey) return
    setChangingEmail(true)
    try {
      const res = await fetch(`https://appapi.bots.business/v2/user/email?api_key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      })
      const txt = await res.text()
      let parsed: any = null
      try { parsed = txt ? JSON.parse(txt) : null } catch {}
      if (!res.ok) {
        const msg = parsed?.error || `Email change failed: ${res.status}`
        throw new Error(msg)
      }
      if (parsed?.email) {
        setUser((u) => (u ? { ...u, email: parsed.email } : u))
        showToast(`Email successfully changed to ${parsed.email}`)
      } else {
        showToast("Email has been successfully updated")
      }
    } catch (e: any) {
      showToast(`Email change failed: ${e?.message ?? "Unknown error"}`, "destructive")
    } finally {
      setChangingEmail(false)
      setShowEmailConfirmModal(false)
    }
  }
  async function submitPasswordUpdate() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Missing fields: Please fill all password fields", "destructive")
      return
    }
    if (newPassword !== confirmPassword) {
      showToast("Password mismatch: Confirm password does not match", "destructive")
      return
    }
    setUpdatingPassword(true)
    try {
      const res = await fetch(`https://appapi.bots.business/v2/auth?api_key=${encodeURIComponent(apiKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
          current_password: currentPassword,
          password_confirmation: confirmPassword,
        }),
      })
      if (!res.ok) {
        const txt = await res.text()
        let msg = `Password update failed: ${res.status}`
        try {
          const j = JSON.parse(txt)
          msg = j?.error || msg
        } catch {}
        throw new Error(msg)
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      showToast("Your password has been successfully updated")
    } catch (e: any) {
      showToast(`Password update failed: ${e?.message ?? "Unknown error"}`, "destructive")
    } finally {
      setUpdatingPassword(false)
    }
  }
  async function doLogoutAllDevices() {
    if (!apiKey) return
    setLoggingOutAll(true)
    try {
      await fetch(`https://appapi.bots.business/v2/auth/sign_out?api_key=${encodeURIComponent(apiKey)}`, { method: "DELETE" })
    } catch {}
    try {
      localStorage.removeItem("mybb_api_key")
      localStorage.removeItem("mybb_user")
    } catch {}
    window.location.href = "/app/"
  }
  async function linkNewAccount() {
    if (!apiKey) return
    setLinkingNew(true)
    try {
      const res = await fetch(`https://appapi.bots.business/v2/user/tg_connection_link?api_key=${encodeURIComponent(apiKey)}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to get link: ${res.status}`)
      const data = await res.json()
      const link = data?.link
      if (!link) throw new Error("No link in response")
      window.open(link, "_blank", "noopener,noreferrer")
    } catch (e: any) {
      showToast(`Failed to get Telegram link: ${e?.message ?? "Unknown error"}`, "destructive")
    } finally {
      setLinkingNew(false)
    }
  }
  async function confirmResetApiKey() {
    if (!apiKey) return
    setResettingKey(true)
    try {
      const res = await fetch(`https://appapi.bots.business/v2/user/reset_api_key?api_key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        const txt = await res.text()
        let msg = `Reset failed: ${res.status}`
        try { msg = JSON.parse(txt)?.error || msg } catch {}
        throw new Error(msg)
      }
      const data: User = await res.json()
      setUser((u) => (u ? { ...u, api_key: data.api_key } : data))
      try {
        localStorage.setItem("mybb_api_key", data.api_key)
        setApiKey(data.api_key)
      } catch {}
      showToast("API key reset. Stored locally and applied to session.")
      setShowResetKeyModal(false)
    } catch (e: any) {
      showToast(`API key reset failed: ${e?.message ?? "Unknown error"}`, "destructive")
    } finally {
      setResettingKey(false)
    }
  }
  const isBusy = loadingUser
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your profile, security, and connected accounts.</p>
            </div>
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile</h2>
              <Button variant="outline" onClick={() => setShowResetKeyModal(true)} disabled={isBusy}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset API Key
              </Button>
            </div>
            {isBusy ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading account…</div>
            ) : user ? (
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={user.email} readOnly className="bg-card pl-10" />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.email, "email")} aria-label="Copy email">
                      {copyEmailOk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">API Key</span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={user.api_key} readOnly className="bg-card font-mono pl-10" />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.api_key, "key")} aria-label="Copy API key">
                      {copyKeyOk ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input value={new Date(user.created_at).toLocaleString()} readOnly className="bg-card pl-10" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-destructive">Failed to load user.</div>
            )}
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Change Email</h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="your@email.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Button onClick={() => setShowEmailConfirmModal(true)} disabled={changingEmail || !emailInput} className="w-full">
                {changingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {changingEmail ? "Updating..." : "Change Email"}
              </Button>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Update Password</h2>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">Current Password</span>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
               
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">New Password</span>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
               
                <div className="grid gap-2">
                  <span className="text-sm text-muted-foreground">Confirm New Password</span>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={submitPasswordUpdate} disabled={updatingPassword} className="w-full">
                {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Sessions</h2>
            </div>
            {loadingSessions ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading sessions…</div>
            ) : sessions ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <div className="text-sm text-muted-foreground">Total active sessions</div>
                </div>
                <Separator />
                <Button variant="destructive" onClick={() => setShowLogoutAllModal(true)} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out of all devices
                </Button>
              </div>
            ) : (
              <div className="text-destructive">Failed to load sessions.</div>
            )}
          </Card>
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Linked Telegram Accounts</h2>
            {loadingLinked ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading linked accounts…</div>
            ) : linked ? (
              <div className="grid gap-4">
                {linked.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center">No linked accounts.</div>
                ) : (
                  linked.map((acc) => {
                    const fullName = [acc.first_name, acc.last_name].filter(Boolean).join(" ").trim() || "Unknown"
                    return (
                      <div key={acc.id} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-card">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate text-primary">{fullName}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            ID: {acc.telegramid} • @{acc.username ?? "unknown"}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <Button onClick={linkNewAccount} disabled={linkingNew} className="w-full">
                  {linkingNew ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                  {linkingNew ? "Opening..." : "Link new account"}
                </Button>
              </div>
            ) : (
              <div className="text-destructive">Failed to load linked accounts.</div>
            )}
          </Card>
        </main>
      </div>
      {showResetKeyModal ? (
        <DeleteConfirmModal
          title="Reset API Key?"
          description={
            <>
              This will invalidate your current API key and generate a new one. Your local key will be replaced in this browser.
              <br />
              You will need to update any services using the old key.
            </>
          }
          confirmText="Reset"
          isLoading={resettingKey}
          onConfirm={confirmResetApiKey}
          onCancel={() => setShowResetKeyModal(false)}
        />
      ) : null}
      {showLogoutAllModal ? (
        <DeleteConfirmModal
          title="Log out everywhere?"
          description="This will revoke all active sessions on all devices and redirect you to the app login."
          confirmText={loggingOutAll ? "Logging out..." : "Log out"}
          isLoading={loggingOutAll}
          onConfirm={doLogoutAllDevices}
          onCancel={() => setShowLogoutAllModal(false)}
        />
      ) : null}
      {showEmailConfirmModal ? (
        <DeleteConfirmModal
          title="Change Email?"
          description={`Are you sure you want to change your email to ${emailInput}?`}
          confirmText={changingEmail ? "Changing..." : "Change Email"}
          isLoading={changingEmail}
          onConfirm={submitEmailChange}
          onCancel={() => setShowEmailConfirmModal(false)}
        />
      ) : null}
      {toastMessage && (
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-10 z-50 px-4 py-2 rounded-md shadow-lg text-sm font-medium
          bg-white text-black border
        `}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}