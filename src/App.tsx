
import { useEffect, useState } from 'react'

export default function App() {
  const [romName, setRomName] = useState('No ROM Loaded')
  const [hackName, setHackName] = useState('No Romhack Loaded')
  const [cores, setCores] = useState<string[]>([])
  const [selectedCore, setSelectedCore] = useState('')
  const [status, setStatus] = useState('Ready')
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem('ae64_cores')
    if (saved) {
      setCores(JSON.parse(saved))
    }

    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const uploadRom = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRomName(file.name)
    setStatus('ROM Loaded')
  }

  const uploadHack = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    setHackName(file.name)
    setStatus('Romhack Loaded')
  }

  const patchRom = () => {
    if (romName === 'No ROM Loaded') {
      alert('Load a ROM first.')
      return
    }

    if (hackName === 'No Romhack Loaded') {
      alert('Load a romhack patch first.')
      return
    }

    setStatus('Patch Ready (frontend support enabled)')
  }

  const uploadCore = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    const updated = [...cores, file.name]
    setCores(updated)

    localStorage.setItem('ae64_cores', JSON.stringify(updated))

    setStatus('Core Added')
  }

  const installApp = async () => {
    if (!installPrompt) {
      alert('Install prompt not available yet.')
      return
    }

    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className="app">
      <div className="background" />

      <header className="header">
        <h1 className="title">auto_enhancer64</h1>
      </header>

      <main className="panel">

        <label className="button">
          Upload ROM
          <input type="file" hidden onChange={uploadRom} />
        </label>

        <label className="button">
          Upload Romhack Patch
          <input
            type="file"
            accept=".bps,.ips,.ups,.xdelta,.patch"
            hidden
            onChange={uploadHack}
          />
        </label>

        <button className="button" onClick={patchRom}>
          Patch ROM
        </button>

        <label className="button">
          Upload Emulator Core
          <input type="file" hidden onChange={uploadCore} />
        </label>

        <select
          className="dropdown"
          value={selectedCore}
          onChange={(e) => setSelectedCore(e.target.value)}
        >
          <option value="">Select Core</option>

          {cores.map((core) => (
            <option key={core} value={core}>
              {core}
            </option>
          ))}
        </select>

        <button className="button" onClick={installApp}>
          Download Emulator
        </button>

        <div className="status">
          <div>ROM: {romName}</div>
          <div>Hack: {hackName}</div>
          <div>Core: {selectedCore || 'None Selected'}</div>
          <div>{status}</div>
        </div>

      </main>
    </div>
  )
}
