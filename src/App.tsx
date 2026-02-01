import { useState, useEffect } from 'react'

const ONTARIO_TZ = 'America/Toronto'
const AUSTRALIA_TZ = 'Australia/Sydney'

function formatTimeForTz(date: Date, tz: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatDateForTz(date: Date, tz: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getTimezoneLabel(date: Date, tz: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    timeZoneName: 'short',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value ?? ''
}

function parseTzTime(timeStr: string, tz: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(referenceDate)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '0'

  const tzDate = new Date(
    `${get('year')}-${get('month')}-${get('day')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  )

  const currentTzTime = new Date(
    `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`
  )

  const offsetMs = referenceDate.getTime() - currentTzTime.getTime()
  return new Date(tzDate.getTime() + offsetMs)
}

function App() {
  const [now, setNow] = useState(new Date())
  const [ontarioTime, setOntarioTime] = useState('')
  const [australiaTime, setAustraliaTime] = useState('')
  const [ontarioDate, setOntarioDate] = useState('')
  const [australiaDate, setAustraliaDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow(d)
      setOntarioTime(formatTimeForTz(d, ONTARIO_TZ))
      setAustraliaTime(formatTimeForTz(d, AUSTRALIA_TZ))
      setOntarioDate(formatDateForTz(d, ONTARIO_TZ))
      setAustraliaDate(formatDateForTz(d, AUSTRALIA_TZ))
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const handleOntarioChange = (value: string) => {
    setOntarioTime(value)
    if (/^\d{2}:\d{2}$/.test(value)) {
      const utcDate = parseTzTime(value, ONTARIO_TZ, now)
      setAustraliaTime(formatTimeForTz(utcDate, AUSTRALIA_TZ))
      setAustraliaDate(formatDateForTz(utcDate, AUSTRALIA_TZ))
      setOntarioDate(formatDateForTz(utcDate, ONTARIO_TZ))
    }
  }

  const handleAustraliaChange = (value: string) => {
    setAustraliaTime(value)
    if (/^\d{2}:\d{2}$/.test(value)) {
      const utcDate = parseTzTime(value, AUSTRALIA_TZ, now)
      setOntarioTime(formatTimeForTz(utcDate, ONTARIO_TZ))
      setOntarioDate(formatDateForTz(utcDate, ONTARIO_TZ))
      setAustraliaDate(formatDateForTz(utcDate, AUSTRALIA_TZ))
    }
  }

  const resetToNow = () => {
    const d = new Date()
    setNow(d)
    setOntarioTime(formatTimeForTz(d, ONTARIO_TZ))
    setAustraliaTime(formatTimeForTz(d, AUSTRALIA_TZ))
    setOntarioDate(formatDateForTz(d, ONTARIO_TZ))
    setAustraliaDate(formatDateForTz(d, AUSTRALIA_TZ))
  }

  const ontarioLabel = getTimezoneLabel(now, ONTARIO_TZ)
  const australiaLabel = getTimezoneLabel(now, AUSTRALIA_TZ)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Time Converter
        </h1>

        <div className="space-y-6">
          <div className="bg-slate-700/50 rounded-2xl p-4 sm:p-6">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Ontario, Canada
              <span className="ml-2 text-xs text-slate-400">{ontarioLabel}</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">{ontarioDate}</p>
            <input
              type="time"
              value={ontarioTime}
              onChange={(e) => handleOntarioChange(e.target.value)}
              className="w-full box-border bg-slate-800 text-white text-xl sm:text-3xl font-mono rounded-xl px-3 sm:px-4 py-3 border border-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-center">
            <div className="text-slate-400 text-sm">⇅</div>
          </div>

          <div className="bg-slate-700/50 rounded-2xl p-4 sm:p-6">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Sydney, Australia
              <span className="ml-2 text-xs text-slate-400">{australiaLabel}</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">{australiaDate}</p>
            <input
              type="time"
              value={australiaTime}
              onChange={(e) => handleAustraliaChange(e.target.value)}
              className="w-full box-border bg-slate-800 text-white text-xl sm:text-3xl font-mono rounded-xl px-3 sm:px-4 py-3 border border-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          onClick={resetToNow}
          className="mt-6 w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Reset to Now
        </button>
      </div>
    </div>
  )
}

export default App
