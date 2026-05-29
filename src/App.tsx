```tsx
import { useEffect, useRef, useState } from "react"

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [message, setMessage] = useState("Ready")
  const [romLoaded, setRomLoaded] = useState(false)
  const [romName, setRomName] = useState("")
  const [fullscreen, setFullscreen] = useState(false)

  const [keybinds, setKeybinds] = useState({
    up: "W",
    down: "S",
    left: "A",
    right: "D",
    a: "J",
    b: "K",
    start: "ENTER",
  })

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    )

    gradient.addColorStop(0, "#111827")
    gradient.addColorStop(1, "#7c2d12")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#22c55e"
    ctx.font = "34px Arial"

    ctx.fillText("auto_enhancer64", 40, 70)

    ctx.fillStyle = "white"
    ctx.font = "20px Arial"

    ctx.fillText("Core: Parallel N64", 40, 130)
    ctx.fillText("Shader: CRT", 40, 170)
    ctx.fillText("Resolution: 2x", 40, 210)

    ctx.fillStyle = "#93c5fd"

    if (romLoaded) {
      ctx.fillText(`Running: ${romName}`, 40, 290)

      ctx.fillStyle = "#facc15"
      ctx.fillRect(650, 180, 200, 200)

      ctx.fillStyle = "black"
      ctx.font = "28px Arial"

      ctx.fillText("GAME", 710, 290)
    } else {
      ctx.fillText("Press PLAY to start demo session", 40, 290)
    }
  }, [romLoaded, romName])

  const startDemoGame = () => {
    setRomLoaded(true)
    setRomName("Super Mario 64 Demo")
    setMessage("Demo session started")
  }

  const importRom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setRomLoaded(true)
    setRomName(file.name)
    setMessage(`Loaded ${file.name}`)
  }

  const installApp = async () => {
    if (
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setMessage("App already installed")
      return
    }

    alert(
      "To install:\n\nDesktop Chrome:\nMenu → Install App\n\nMobile:\nAdd to Home Screen"
    )
  }

  const toggleFullscreen = async () => {
    const container = canvasRef.current?.parentElement

    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        setFullscreen(true)
      } else {
        await document.exitFullscreen()
        setFullscreen(false)
      }
    } catch {
      setMessage("Fullscreen blocked")
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom,#1e3a8a 0%,#1e3a8a 33%,#f5deb3 33%,#f5deb3 66%,#b91c1c 66%,#b91c1c 100%)",
        color: "white",
      }}
    >
      <header
        style={{
          background: "#09090b",
          borderBottom: "1px solid #27272a",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              margin: 0,
              fontWeight: 900,
              transform: "skew(-8deg)",
              textShadow: "5px 5px 0 black",
            }}
          >
            auto_enhancer64
          </h1>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                background: "#27272a",
                padding: "12px 18px",
                borderRadius: "14px",
                cursor: "pointer",
              }}
            >
              Import ROM
              <input
                type="file"
                accept=".n64,.z64,.v64"
                style={{ display: "none" }}
                onChange={importRom}
              />
            </label>

            <button
              onClick={startDemoGame}
              style={{
                background: "#16a34a",
                border: "none",
                padding: "12px 18px",
                borderRadius: "14px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Play Demo
            </button>

            <button
              onClick={installApp}
              style={{
                background: "#2563eb",
                border: "none",
                padding: "12px 18px",
                borderRadius: "14px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Download App
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
          padding: "20px",
        }}
      >
        <aside
          style={{
            background: "#09090b",
            borderRadius: "24px",
            padding: "20px",
            border: "1px solid #27272a",
          }}
        >
          <h2>Keybinds</h2>

          {Object.entries(keybinds).map(([action, key]) => (
            <div
              key={action}
              style={{
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  marginBottom: "5px",
                  textTransform: "capitalize",
                }}
              >
                {action}
              </div>

              <input
                value={key}
                onChange={(e) =>
                  setKeybinds((prev) => ({
                    ...prev,
                    [action]: e.target.value.toUpperCase(),
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #3f3f46",
                  background: "#18181b",
                  color: "white",
                }}
              />
            </div>
          ))}
        </aside>

        <section
          style={{
            background: "#09090b",
            borderRadius: "24px",
            padding: "20px",
            border: "1px solid #27272a",
          }}
        >
          <div
            style={{
              marginBottom: "15px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Emulator Runtime
              </h2>

              <div
                style={{
                  color: "#a1a1aa",
                  marginTop: "5px",
                }}
              >
                {message}
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              style={{
                background: "#27272a",
                border: "none",
                padding: "10px 16px",
                borderRadius: "12px",
                color: "white",
                cursor: "pointer",
              }}
            >
              {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            style={{
              width: "100%",
              borderRadius: "20px",
              border: "1px solid #27272a",
              background: "black",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {["↑", "↓", "←", "→", "A", "B"].map((btn) => (
              <button
                key={btn}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "999px",
                  border: "none",
                  background: "#18181b",
                  color: "white",
                  fontSize: "24px",
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
```
