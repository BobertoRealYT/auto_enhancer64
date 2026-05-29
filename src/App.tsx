```tsx
import { useState, useEffect } from "react"

export default function App() {
  const defaultKeybinds = {
    up: "ARROWUP",
    down: "ARROWDOWN",
    left: "ARROWLEFT",
    right: "ARROWRIGHT",
    a: "Z",
    b: "X",
    start: "ENTER",
  }

  const [romName, setRomName] = useState("")
  const [message, setMessage] = useState("Ready")
  const [selectedCore, setSelectedCore] = useState("Parallel N64")
  const [selectedShader, setSelectedShader] = useState("CRT")
  const [resolution, setResolution] = useState("2x")
  const [keybinds, setKeybinds] = useState(defaultKeybinds)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [saveStates, setSaveStates] = useState<string[]>([])

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const importRom = (e: any) => {
    const file = e.target.files?.[0]

    if (!file) return

    setRomName(file.name)
    setMessage("ROM Loaded: " + file.name)
  }

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const choice = await deferredPrompt.userChoice

      if (choice.outcome === "accepted") {
        setMessage("App installed successfully")
      } else {
        setMessage("Install cancelled")
      }

      setDeferredPrompt(null)
    } else {
      alert(
        "Install not available yet.\n\nOn Chrome:\nMenu → Install App\n\nOn mobile:\nAdd to Home Screen"
      )
    }
  }

  const createSaveState = () => {
    const save = "Save State " + (saveStates.length + 1)

    setSaveStates([...saveStates, save])

    setMessage(save + " created")
  }

  const resetKey = (key: keyof typeof defaultKeybinds) => {
    setKeybinds({
      ...keybinds,
      [key]: defaultKeybinds[key],
    })
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom,#1d4ed8 0%,#1d4ed8 33%,#f5deb3 33%,#f5deb3 66%,#ea580c 66%,#ea580c 100%)",
        color: "white",
        fontFamily: "Arial",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          padding: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "900",
            margin: 0,
            textShadow: "6px 6px 0px black",
            color: "#22c55e",
          }}
        >
          auto_enhancer64
        </h1>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <label
            style={{
              background: "#111827",
              padding: "12px 18px",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            Import ROM
            <input
              type="file"
              accept=".n64,.z64,.v64"
              onChange={importRom}
              hidden
            />
          </label>

          <button
            onClick={installApp}
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
            Download Emulator
          </button>

          <button
            onClick={() => {
              setRomName("Super Mario 64 Demo")
              setMessage("Demo session started")
            }}
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
            Play Demo
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#09090b",
            borderRadius: "24px",
            padding: "20px",
          }}
        >
          <h2>Settings</h2>

          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label>Core</label>

              <select
                value={selectedCore}
                onChange={(e) => setSelectedCore(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                }}
              >
                <option>Parallel N64</option>
                <option>Mupen64Plus</option>
                <option>Angrylion</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Shader</label>

              <select
                value={selectedShader}
                onChange={(e) => setSelectedShader(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                }}
              >
                <option>CRT</option>
                <option>Scanlines</option>
                <option>Bloom</option>
                <option>None</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Resolution</label>

              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "12px",
                }}
              >
                <option>Native</option>
                <option>2x</option>
                <option>4x</option>
              </select>
            </div>
          </div>

          <h2 style={{ marginTop: "40px" }}>Keybinds</h2>

          <div style={{ marginTop: "20px" }}>
            {Object.entries(keybinds).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: "14px",
                  background: "#18181b",
                  padding: "12px",
                  borderRadius: "14px",
                }}
              >
                <div style={{ marginBottom: "8px" }}>{key}</div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    value={value}
                    onChange={(e) =>
                      setKeybinds({
                        ...keybinds,
                        [key]: e.target.value.toUpperCase(),
                      })
                    }
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  />

                  <button
                    onClick={() =>
                      resetKey(key as keyof typeof defaultKeybinds)
                    }
                    style={{
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "40px" }}>Save States</h2>

          <button
            onClick={createSaveState}
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "14px",
              marginTop: "12px",
              cursor: "pointer",
            }}
          >
            Create Save State
          </button>

          <div style={{ marginTop: "20px" }}>
            {saveStates.map((save) => (
              <div
                key={save}
                style={{
                  background: "#18181b",
                  padding: "12px",
                  borderRadius: "12px",
                  marginBottom: "10px",
                }}
              >
                {save}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#09090b",
            borderRadius: "24px",
            padding: "20px",
          }}
        >
          <h2>Emulator Runtime</h2>

          <div
            style={{
              marginTop: "20px",
              background: "black",
              borderRadius: "20px",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "#22c55e",
              border: "3px solid #27272a",
            }}
          >
            {romName
              ? "Running: " + romName
              : "No ROM Running"}
          </div>

          <div
            style={{
              marginTop: "20px",
              background: "#18181b",
              padding: "16px",
              borderRadius: "16px",
            }}
          >
            <strong>Status:</strong> {message}
          </div>
        </div>
      </div>
    </div>
  )
}
```
