import React, { useMemo, useState } from 'react'
import axios from 'axios'

export default function App() {
  const [form, setForm] = useState({ username: 'staff', password: 'password' })
  const [token, setToken] = useState('')
  const [balance, setBalance] = useState(null)
  const [apply, setApply] = useState({ username: 'staff', type: 'PTO', startDate: '', endDate: '', reason: '' })
  const [message, setMessage] = useState('')

  const AUTH_URL = useMemo(() => (import.meta.env.VITE_AUTH_URL || 'http://localhost:8081'), [])
  const LEAVE_URL = useMemo(() => (import.meta.env.VITE_LEAVE_URL || 'http://localhost:8082'), [])

  const login = async () => {
    try {
      const res = await axios.post(`${AUTH_URL}/api/auth/register`, { username: form.username, password: form.password, email: `${form.username}@example.com` })
      setToken(res.data.token)
      setMessage('Registered and logged in!')
    } catch (e) {
      // if user exists, try login
      try {
        const res = await axios.post(`${AUTH_URL}/api/auth/login`, form)
        setToken(res.data.token)
        setMessage('Logged in!')
      } catch (err) {
        setMessage('Login failed')
      }
    }
  }

  const fetchBalance = async () => {
    const res = await axios.get(`${LEAVE_URL}/api/leaves/balance/${form.username}`)
    setBalance(res.data)
  }

  const applyLeave = async () => {
    const res = await axios.post(`${LEAVE_URL}/api/leaves/apply`, apply)
    setMessage(`Applied! ID=${res.data.id}`)
  }

  return (
    <div className="container">
      <header>
        <h1>Leave Management System</h1>
        <p>SheCanCode School</p>
      </header>

      <section className="card">
        <h2>1. Login / Register</h2>
        <div className="grid">
          <input placeholder="username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
          <input placeholder="password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          <button onClick={login}>Login/Register</button>
        </div>
        {token && <div className="badge">JWT acquired</div>}
      </section>

      <section className="card">
        <h2>2. Balance</h2>
        <button onClick={fetchBalance}>Fetch Balance</button>
        {balance && <div className="info">{balance.username}: {balance.remainingDays} days</div>}
      </section>

      <section className="card">
        <h2>3. Apply for Leave</h2>
        <div className="grid">
          <select value={apply.type} onChange={e=>setApply({...apply, type: e.target.value})}>
            <option value="PTO">Personal Time Off</option>
            <option value="SICK">Sick Leave</option>
            <option value="COMPASSIONATE">Compassionate Leave</option>
            <option value="MATERNITY">Maternity Leave</option>
            <option value="OTHER">Other</option>
          </select>
          <input type="date" value={apply.startDate} onChange={e=>setApply({...apply, startDate: e.target.value})} />
          <input type="date" value={apply.endDate} onChange={e=>setApply({...apply, endDate: e.target.value})} />
          <input placeholder="reason (optional)" value={apply.reason} onChange={e=>setApply({...apply, reason: e.target.value})} />
          <button onClick={applyLeave}>Apply</button>
        </div>
      </section>

      {message && <div className="toast">{message}</div>}

      <footer>
        <a href={`${AUTH_URL}/swagger-ui.html`} target="_blank">Auth Swagger</a>
        <a href={`${LEAVE_URL}/swagger-ui.html`} target="_blank">Leave Swagger</a>
      </footer>
    </div>
  )
}
