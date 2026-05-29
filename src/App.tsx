import { useEffect, useMemo, useRef, useState } from "react"

// PWA-ready emulator frontend
// Add these files to make the app installable:
// public/manifest.json
// public/sw.js
// public/icon-192.png
// public/icon-512.png

export default function N64EmulatorFrontend() {
  const emulatorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const defaultKeybinds = {
    dpadUp: "ARROWUP",
    dpadDown: "ARROWDOWN",
    dpadLeft: "ARROWLEFT",
    dpadRight: "ARROWRIGHT",
    analogUp: "W",
    analogDown: "S",
    analogLeft: "A",
    analogRight: "D",
    a: "J",
    b: "K",
    start: "ENTER",
    z: "L",
    l: "Q",
    r: "E",
    cUp: "I",
    cDown: "K",
    cLeft: "J",
    cRight: "L",
    quickMenu: "ESCAPE",
    saveState: "F5",
    loadState: "F8",
    nextSaveSlot: "]",
    previousSaveSlot: "[",
    screenshot: "F12",
    fullscreen: "F11",
    pause: "P",
    fastForward: "TAB",
  }

  const [selectedCore, setSelectedCore] = useState("Parallel N64")
  const [selectedShader, setSelectedShader] = useState("CRT")
  const [resolution, setResolution] = useState("2x")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [saveStates, setSaveStates] = useState<string[]>([])
  const [showResetModal, setShowResetModal] = useState(false)
  const [gameToReset, setGameToReset] = useState<string | null>(null)
  const [keybinds, setKeybinds] = useState(defaultKeybinds)
  const [romName, setRomName] = useState("")
  const [romLoaded, setRomLoaded] = useState(false)
  const [message, setMessage] = useState("No ROM loaded")
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [currentSaveSlot, setCurrentSaveSlot] = useState(1)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [search, setSearch] = useState("")

  const [games, setGames] = useState([
    {
      title: "Super Mario 64",
      lastPlayed: "2 hours ago",
    },
    {
      title: "Ocarina of Time",
      lastPlayed: "Yesterday",
    },
    {
      title: "Mario Kart 64",
      lastPlayed: "3 days ago",
    },
  ])

  const cores = [
    "Parallel N64",
    "Mupen64Plus",
    "Angrylion",
    "GlideN64",
  ]

  const shaders = [
    "None",
    "CRT",
    "Scanlines",
    "Bloom",
    "FXAA",
    "Sharp Pixels",
  ]

  useEffect(() => {
    const installHandler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMessage("App can now be installed")
    }

    window.addEventListener("beforeinstallprompt", installHandler)

    if (
      "serviceWorker" in navigator &&
      window.isSecureContext &&
      location.protocol !== "file:"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            console.log("Service worker registered")
          })
          .catch((err) => {
            console.error(err)
            setMessage(
              "Service worker unavailable in this preview environment"
            )
          })
      })
    } else {
      console.warn("Service workers are disabled in this environment")
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        installHandler
      )
    }
  }, [])

  useEffect(() => {
    const storedGames = localStorage.getItem("n64-library")
    const storedStates = localStorage.getItem("n64-save-states")
    const storedKeybinds = localStorage.getItem("n64-keybinds")

    if (storedGames) {
      setGames(JSON.parse(storedGames))
    }

    if (storedStates) {
      setSaveStates(JSON.parse(storedStates))
    }

    if (storedKeybinds) {
      setKeybinds(JSON.parse(storedKeybinds))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("n64-library", JSON.stringify(games))
  }, [games])

  useEffect(() => {
    localStorage.setItem("n64-save-states", JSON.stringify(saveStates))
  }, [saveStates])

  useEffect(() => {
    localStorage.setItem("n64-keybinds", JSON.stringify(keybinds))
  }, [keybinds])

  useEffect(() => {
    const canvas = emulatorCanvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#18181b")
    gradient.addColorStop(1, "#7f1d1d")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#22c55e"
    ctx.font = "28px sans-serif"
    ctx.fillText("auto_enhancer64 Runtime", 40, 80)

    ctx.fillStyle = "white"
    ctx.font = "20px sans-serif"

    ctx.fillText(`Core: ${selectedCore}`, 40, 150)
    ctx.fillText(`Shader: ${selectedShader}`, 40, 190)
    ctx.fillText(`Resolution: ${resolution}`, 40, 230)

    ctx.fillStyle = "#a1a1aa"
    ctx.font = "16px sans-serif"

    ctx.fillText(
      `Controls: ${keybinds.up}/${keybinds.down}/${keybinds.left}/${keybinds.right} • A:${keybinds.a} • B:${keybinds.b}`,
      40,
      270
    )

    if (romLoaded) {
      ctx.fillStyle = "#60a5fa"
      ctx.fillText(`Loaded ROM: ${romName}`, 40, 320)

      ctx.fillStyle = "#facc15"
      ctx.fillRect(420, 150, 180, 180)

      ctx.fillStyle = "black"
      ctx.font = "26px sans-serif"
      ctx.fillText("GAME", 470, 250)
    }
  }, [selectedCore, selectedShader, resolution, romLoaded, romName, keybinds])

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [games, search])

  const handleImportRom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setRomName(file.name)
    setRomLoaded(true)
    setMessage(`Loaded ROM: ${file.name}`)

    const alreadyExists = games.find((g) => g.title === file.name)

    if (!alreadyExists) {
      setGames((prev) => [
        {
          title: file.name,
          lastPlayed: "Just now",
        },
        ...prev,
      ])
    }
  }

  const handleSaveState = () => {
    if (!romLoaded) {
      setMessage("Load a ROM before creating a save state")
      return
    }

    const stateName = `Save ${saveStates.length + 1} • ${new Date().toLocaleTimeString()}`

    setSaveStates((prev) => [...prev, stateName])
    setMessage(`Created ${stateName}`)
  }

  const handleLoadState = () => {
    if (saveStates.length === 0) {
      setMessage("No save states available")
      return
    }

    setMessage(`Loaded ${saveStates[saveStates.length - 1]}`)
  }

  const nextSaveSlot = () => {
    setCurrentSaveSlot((prev) => prev + 1)
    setMessage(`Switched to save slot ${currentSaveSlot + 1}`)
  }

  const previousSaveSlot = () => {
    const next = Math.max(1, currentSaveSlot - 1)
    setCurrentSaveSlot(next)
    setMessage(`Switched to save slot ${next}`)
  }

  const exportSaveState = () => {
    const data = {
      rom: romName,
      slot: currentSaveSlot,
      states: saveStates,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${romName || "save"}-slot-${currentSaveSlot}.state`
    a.click()
    URL.revokeObjectURL(url)

    setMessage("Save state exported")
  }

  const importSaveState = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)

        if (parsed.states) {
          setSaveStates(parsed.states)
        }

        if (parsed.slot) {
          setCurrentSaveSlot(parsed.slot)
        }

        setMessage("Imported save state file")
      } catch {
        setMessage("Invalid save state file")
      }
    }

    reader.readAsText(file)
  }

  const takeScreenshot = () => {
    const canvas = emulatorCanvasRef.current

    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${romName || "screenshot"}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()

    setMessage("Screenshot saved")
  }

  const handleFullscreen = async () => {
    const container = emulatorCanvasRef.current?.parentElement

    if (!container) {
      setMessage("Fullscreen container unavailable")
      return
    }

    if (!document.fullscreenEnabled) {
      setMessage("Fullscreen is blocked in this environment")
      return
    }

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        setIsFullscreen(true)
        setMessage("Entered fullscreen mode")
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
        setMessage("Exited fullscreen mode")
      }
    } catch (error) {
      console.error(error)
      setMessage("Fullscreen was blocked by browser permissions policy")
    }
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const installApp = async () => {
    // Real PWA install flow
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const result = await deferredPrompt.userChoice

      if (result.outcome === "accepted") {
        setMessage("auto_enhancer64 installed successfully")
      } else {
        setMessage("Install canceled")
      }

      setDeferredPrompt(null)
      return
    }

    // Preview/sandbox fallback
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

    if (isIOS) {
      setMessage(
        "iPhone/iPad: tap Share then Add to Home Screen"
      )
      return
    }

    setMessage(
      "Install unavailable in preview mode. Deploy to HTTPS to enable PWA installation."
    )
  }

  const resetKeybinds = () => {
    setKeybinds(defaultKeybinds)
    setMessage("Keybinds reset to defaults")
  }

  const resetSingleKeybind = (
    action: keyof typeof defaultKeybinds
  ) => {
    setKeybinds((prev) => ({
      ...prev,
      [action]: defaultKeybinds[action],
    }))

    setMessage(`${action.toUpperCase()} reset to default`)
  }

  const resetGameProgress = (gameName: string) => {
    setGames((prev) =>
      prev.map((game) =>
        game.title === gameName
          ? { ...game, lastPlayed: "Never played" }
          : game
      )
    )

    setSaveStates([])
    setMessage(`Reset save progress for ${gameName}`)
    setShowResetModal(false)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#1e3a8a_0%,#1e3a8a_33%,#f5e6b3_33%,#f5e6b3_66%,#dc2626_66%,#dc2626_100%)] bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="-mt-[10px]">
            <h1
              className="select-none text-5xl font-black leading-none flex gap-[1px]"
              style={{
                fontFamily: '"Arial Black", "Impact", sans-serif',
                transform: 'skew(-10deg) rotate(-2deg)',
                filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.45))',
              }}
            >
              {[
                ['a', '#ffd400'],
                ['u', '#2563eb'],
                ['t', '#ff66d9'],
                ['o', '#22c55e'],
                ['_', '#ff2d2d'],
                ['e', '#ffd400'],
                ['n', '#2563eb'],
                ['h', '#22c55e'],
                ['a', '#ff66d9'],
                ['n', '#ff9a00'],
                ['c', '#22c55e'],
                ['e', '#2563eb'],
                ['r', '#ff2d2d'],
                ['6', '#ffd400'],
                ['4', '#22c55e'],
              ].map(([char, color], i) => (
                <span
                  key={i}
                  style={{
                    color,
                    WebkitTextStroke: '2px white',
                    textShadow:
                      '2px 2px 0 #f59e0b, 4px 4px 0 #2563eb, 6px 6px 0 rgba(0,0,0,0.55)',
                    display: 'inline-block',
                  }}
                >
                  {char}
                </span>
              ))}
            </h1>

            <p className="text-sm text-zinc-400">
              
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={triggerImport}
              className="rounded-2xl bg-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-700"
            >
              Import ROM
            </button>

            <button
              onClick={async () => {
                // Attempt real install first
                if (deferredPrompt) {
                  deferredPrompt.prompt()

                  const result = await deferredPrompt.userChoice

                  if (result.outcome === "accepted") {
                    setMessage("auto_enhancer64 installed successfully")
                  } else {
                    setMessage("Install canceled")
                  }

                  setDeferredPrompt(null)
                  return
                }

                // Generate manifest fallback for preview environments
                const manifest = {
                  name: "auto_enhancer64",
                  short_name: "auto_enhancer64",
                  start_url: "/",
                  display: "standalone",
                  background_color: "#000000",
                  theme_color: "#000000",
                  orientation: "landscape",
                  icons: [
                    {
                      src: "/icon-192.png",
                      sizes: "192x192",
                      type: "image/png",
                    },
                    {
                      src: "/icon-512.png",
                      sizes: "512x512",
                      type: "image/png",
                    },
                  ],
                }

                const blob = new Blob(
                  [JSON.stringify(manifest, null, 2)],
                  {
                    type: "application/json",
                  }
                )

                const url = URL.createObjectURL(blob)

                const link = document.createElement("a")
                link.href = url
                link.download = "manifest.json"
                link.click()

                URL.revokeObjectURL(url)

                setMessage(
                  "PWA install unavailable in preview. Downloaded manifest.json instead."
                )
              }}
              className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium transition hover:bg-green-500"
            >
              Download Emulator
            </button>
          </div>
        </div>
      </header>

      <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".n64,.z64,.v64,.zip"
        className="hidden"
        onChange={handleImportRom}
      />

      <input
        type="file"
        accept=".state,.savestate,.json"
        className="hidden"
        id="import-save-state"
        onChange={importSaveState}
      />
      </>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <h2 className="mb-5 text-lg font-semibold">Emulator Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Emulator Core
                </label>

                <select
                  value={selectedCore}
                  onChange={(e) => setSelectedCore(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                >
                  {cores.map((core) => (
                    <option key={core}>{core}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Shader
                </label>

                <select
                  value={selectedShader}
                  onChange={(e) => setSelectedShader(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                >
                  {shaders.map((shader) => (
                    <option key={shader}>{shader}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Internal Resolution
                </label>

                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none"
                >
                  <option>Native</option>
                  <option>2x</option>
                  <option>4x</option>
                  <option>8x</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold">All Keybinds</h2>

            <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
              Includes:
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
                <div>D-Pad Controls</div>
                <div>Analog Stick</div>
                <div>C Buttons</div>
                <div>A / B / Start</div>
                <div>Z / L / R</div>
                <div>Save State Hotkeys</div>
                <div>Quick Menu</div>
                <div>Screenshot</div>
                <div>Fullscreen</div>
              </div>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {Object.entries(keybinds).map(([action, key]) => {
                const labels: Record<string, string> = {
                  dpadUp: "D-Pad Up",
                  dpadDown: "D-Pad Down",
                  dpadLeft: "D-Pad Left",
                  dpadRight: "D-Pad Right",
                  analogUp: "Analog Stick Up",
                  analogDown: "Analog Stick Down",
                  analogLeft: "Analog Stick Left",
                  analogRight: "Analog Stick Right",
                  a: "A Button",
                  b: "B Button",
                  start: "Start Button",
                  z: "Z Trigger",
                  l: "L Trigger",
                  r: "R Trigger",
                  cUp: "C-Up",
                  cDown: "C-Down",
                  cLeft: "C-Left",
                  cRight: "C-Right",
                  quickMenu: "Quick Menu",
                  saveState: "Save State",
                  loadState: "Load State",
                  nextSaveSlot: "Next Save Slot",
                  previousSaveSlot: "Previous Save Slot",
                  screenshot: "Screenshot",
                  fullscreen: "Fullscreen",
                  pause: "Pause Emulator",
                  fastForward: "Fast Forward",
                }

                return (
                  <div
                    key={action}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-white">
                          {labels[action] || action}
                        </div>

                        <div className="text-xs text-zinc-500">
                          Editable emulator keybind
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          value={key}
                          onChange={(e) =>
                            setKeybinds((prev) => ({
                              ...prev,
                              [action]: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="Press key"
                          className="w-32 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-center text-white outline-none focus:border-green-500"
                        />

                        <button
                          onClick={() =>
                            resetSingleKeybind(
                              action as keyof typeof defaultKeybinds
                            )
                          }
                          className="rounded-xl bg-zinc-800 px-3 py-2 text-xs transition hover:bg-zinc-700"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={resetKeybinds}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium transition hover:bg-red-500"
              >
                Reset Keybinds To Default
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold">Save States</h2>

            <div className="space-y-3">
              {saveStates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
                  No save states created yet
                </div>
              ) : (
                saveStates.map((state) => (
                  <div
                    key={state}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-sm"
                  >
                    {state}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Emulator Runtime</h2>
                <p className="text-sm text-zinc-400">{message}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowQuickMenu(true)}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm transition hover:bg-blue-500"
                >
                  Quick Menu
                </button>
                <button
                  onClick={handleSaveState}
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm transition hover:bg-zinc-800"
                >
                  Save State
                </button>

                <button
                  onClick={handleLoadState}
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm transition hover:bg-zinc-800"
                >
                  Load State
                </button>

                <button
                  onClick={handleFullscreen}
                  className="rounded-xl bg-zinc-900 px-3 py-2 text-sm transition hover:bg-zinc-800"
                >
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black p-4">
              <canvas
                ref={emulatorCanvasRef}
                width={1280}
                height={720}
                className="h-full w-full rounded-2xl border border-zinc-800 bg-black object-contain"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Game Library</h2>

                <p className="text-sm text-zinc-400">
                  ROMs persist locally using browser storage
                </p>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredGames.map((game) => (
                <div
                  key={game.title}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
                >
                  <div className="mb-4 flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 text-5xl">
                    🎮
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">{game.title}</h3>

                    <p className="text-sm text-zinc-400">
                      Last played: {game.lastPlayed}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={() => {
                          setRomName(game.title)
                          setRomLoaded(true)
                          setMessage(`Booted ${game.title}`)
                        }}
                        className="flex-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium transition hover:bg-green-500"
                      >
                        Play
                      </button>

                      <button
                        onClick={() => {
                          setGameToReset(game.title)
                          setShowResetModal(true)
                        }}
                        className="rounded-xl bg-yellow-600 px-3 py-2 text-sm transition hover:bg-yellow-500"
                      >
                        Reset Save
                      </button>

                      <button
                        onClick={() => {
                          setGames((prev) =>
                            prev.filter((g) => g.title !== game.title)
                          )
                        }}
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm transition hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showQuickMenu && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Quick Menu</h2>

              <button
                onClick={() => setShowQuickMenu(false)}
                className="rounded-xl bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={handleSaveState}
                className="rounded-2xl bg-green-600 px-4 py-4 font-medium hover:bg-green-500"
              >
                Save State
              </button>

              <button
                onClick={handleLoadState}
                className="rounded-2xl bg-blue-600 px-4 py-4 font-medium hover:bg-blue-500"
              >
                Load State
              </button>

              <button
                onClick={nextSaveSlot}
                className="rounded-2xl bg-zinc-800 px-4 py-4 hover:bg-zinc-700"
              >
                Next Save Slot
              </button>

              <button
                onClick={previousSaveSlot}
                className="rounded-2xl bg-zinc-800 px-4 py-4 hover:bg-zinc-700"
              >
                Previous Save Slot
              </button>

              <button
                onClick={exportSaveState}
                className="rounded-2xl bg-purple-600 px-4 py-4 hover:bg-purple-500"
              >
                Export Save State File
              </button>

              <label
                htmlFor="import-save-state"
                className="flex cursor-pointer items-center justify-center rounded-2xl bg-orange-600 px-4 py-4 hover:bg-orange-500"
              >
                Import Save State File
              </label>

              <button
                onClick={takeScreenshot}
                className="rounded-2xl bg-pink-600 px-4 py-4 hover:bg-pink-500"
              >
                Screenshot
              </button>

              <button
                onClick={handleFullscreen}
                className="rounded-2xl bg-cyan-600 px-4 py-4 hover:bg-cyan-500"
              >
                Toggle Fullscreen
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
              Current Save Slot: {currentSaveSlot}
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Reset Game Progress?</h2>

            <p className="mt-3 text-sm text-zinc-400">
              This will permanently remove save progress for:
            </p>

            <p className="mt-2 font-semibold text-white">{gameToReset}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 rounded-2xl bg-zinc-800 px-4 py-3 transition hover:bg-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (gameToReset) {
                    resetGameProgress(gameToReset)
                  }
                }}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium transition hover:bg-red-500"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
