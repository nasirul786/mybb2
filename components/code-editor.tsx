"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  X,
  Copy,
  Search,
  Wand2,
  Edit3,
  Settings2,
} from "lucide-react"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (code: string) => Promise<void> | void
  commandName: string
  initialCode: string
  isLoading?: boolean
  showCloseOnMobile?: boolean
  onEditMeta?: () => void
}

export default function CodeEditor(props: Props) {
  const {
    isOpen,
    onClose,
    onSave,
    commandName,
    initialCode,
    isLoading,
    showCloseOnMobile = true,
    onEditMeta,
  } = props
  const [value, setValue] = useState(initialCode || "")
  const [baseline, setBaseline] = useState(initialCode || "")
  const [toast, setToast] = useState<string | null>(null)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const [kbOffset, setKbOffset] = useState(0)

  const editorRef = useRef<any>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setValue(initialCode || "")
    setBaseline(initialCode || "")
  }, [initialCode])

  const isDirty = value !== baseline
  const isMobile = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches,
    []
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault()
        if (isDirty) doSave()
      }
      if ((e.ctrlKey || e.metaKey) && (key === "f" || key === "h")) {
        e.preventDefault()
        openFindReplace(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isDirty, value])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const requestClose = () => {
    if (isDirty) {
      const ok = confirm("You have unsaved changes. Close without saving?")
      if (!ok) return
    }
    onClose()
  }

  const applyBottomPadding = () => {
    const ed = editorRef.current
    const t = toolbarRef.current
    if (!ed || !t) return
    const pad = t.offsetHeight + kbOffset + 8
    ed.updateOptions({ padding: { top: 8, bottom: pad } })
    ed.layout()
  }

  useEffect(() => {
    applyBottomPadding()
  }, [kbOffset, mobileToolsOpen])

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined
    if (!vv) return
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbOffset(offset)
    }
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    update()
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    const dark = document.documentElement.classList.contains("dark")
    monaco.editor.defineTheme("mybb-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0b0b0b",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorGutter.background": "#0b0b0b",
        "editorCursor.foreground": "#93c5fd",
      },
    })
    monaco.editor.defineTheme("mybb-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#00000008",
        "editorGutter.background": "#ffffff",
        "editorCursor.foreground": "#1e40af",
      },
    })
    monaco.editor.setTheme(dark ? "mybb-dark" : "mybb-light")
    setTimeout(applyBottomPadding, 0)
  }

  const doUndo = () => editorRef.current?.getModel()?.undo()
  const doRedo = () => editorRef.current?.getModel()?.redo()

  const doCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(editorRef.current?.getValue() || "")
      setToast("Copied")
      setTimeout(() => setToast(null), 1200)
    } catch {}
  }

  const doFormat = async () => {
    try {
      const prettier = (await import("prettier/standalone")).default
      const parserBabel = (await import("prettier/plugins/babel")).default
      const formatted = await prettier.format(
        editorRef.current?.getValue() || "",
        {
          parser: "babel",
          plugins: [parserBabel],
          semi: false,
          singleQuote: false,
        }
      )
      setValue(formatted)
      setToast("Formatted")
      setTimeout(() => setToast(null), 1200)
    } catch {
      editorRef.current?.getAction("editor.action.formatDocument")?.run()
    }
  }

  const openFindReplace = (withReplace: boolean) => {
    const ed = editorRef.current
    if (!ed) return
    if (withReplace) ed.getAction("editor.action.startFindReplaceAction")?.run()
    else ed.getAction("actions.find")?.run()
  }

  const doSave = async () => {
    const current = editorRef.current?.getValue() ?? value
    await onSave(current)
    setBaseline(current)
    setToast("Code saved")
    setTimeout(() => setToast(null), 1600)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[40] bg-black/70 backdrop-blur-sm w-full">
      <div className="absolute inset-0 flex flex-col w-full">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b bg-card/95 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={requestClose}
              className="sm:hidden p-2 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute left-0 right-0 pointer-events-none">
            <div className="text-center font-semibold text-sm sm:text-base">
              {commandName}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showCloseOnMobile && (
              <button
                onClick={requestClose}
                className="hidden sm:inline-flex p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full">
          <Monaco
            value={value}
            onChange={(v) => setValue(v || "")}
            language="javascript"
            onMount={handleMount}
            options={{
              fontLigatures: true,
              fontSize: 14,
              minimap: { enabled: !isMobile },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              renderWhitespace: "selection",
              lineNumbers: "on",
            }}
          />
        </div>

        <div
          ref={toolbarRef}
          className="fixed left-0 right-0 bg-card/95 backdrop-blur-xl border-t"
          style={{ bottom: kbOffset }}
        >
          <div className="flex items-center justify-center gap-2 p-2 flex-wrap">
            <Button
              onClick={doSave}
              disabled={!isDirty || !!isLoading}
              className="px-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            <div className="hidden sm:flex gap-2">
              <Button variant="outline" onClick={doUndo} className="px-4">
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" onClick={doRedo} className="px-4">
                <Redo2 className="w-4 h-4 mr-2" />
                Redo
              </Button>
              <Button variant="outline" onClick={onEditMeta} className="px-4">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={doCopyAll} className="px-4">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={doFormat} className="px-4">
                <Wand2 className="w-4 h-4 mr-2" />
                Format
              </Button>
              <Button
                variant="outline"
                onClick={() => openFindReplace(true)}
                className="px-4"
              >
                <Search className="w-4 h-4 mr-2" />
                Find
              </Button>
            </div>

            <div className="sm:hidden flex gap-2">
              <Button variant="outline" onClick={doUndo} className="px-3">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={doRedo} className="px-3">
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={onEditMeta} className="px-3">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => (
                  setMobileToolsOpen((v) => !v), applyBottomPadding()
                )}
                className="px-3"
              >
                {mobileToolsOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Settings2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {mobileToolsOpen && (
            <div className="sm:hidden flex items-center justify-center gap-2 p-2 border-t">
              <Button
                variant="outline"
                onClick={() => openFindReplace(true)}
                className="px-3"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={doCopyAll} className="px-3">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={doFormat} className="px-3">
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[90px] z-[105] bg-foreground text-background text-sm px-4 py-2 rounded-full shadow">
          {toast}
        </div>
      )}
    </div>
  )
}