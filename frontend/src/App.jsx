import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { decodeJwt } from './auth'

function Layout({children, token, user, onLogout}){
  return (
    <>
      <header>
        <div className="nav">
          <div className="logo"><span className="dot"/><h1>SheCanCode LMS</h1></div>
          <nav>
            {!token && <>
              <Link className="link" to="/login">Login</Link>
              <Link className="link" to="/register" style={{marginLeft:12}}>Register</Link>
            </>}
            {token && <>
              <span style={{marginRight:12, color:'var(--muted)'}}>{user?.username} ({user?.role})</span>
              <button onClick={onLogout}>Logout</button>
            </>}
          </nav>
        </div>
      </header>
      <div className="container">{children}</div>
    </>
  )
}

function Login({setAuth}){
  const [form, setForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || import.meta.env.VITE_LEAVE_URL || 'http://localhost:8081',[])
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const nav = useNavigate()

  const doLogin = async ()=>{
    setIsLoading(true); setMessage('')
    try{
      const res = await axios.post(`${AUTH_URL}/api/auth/login`, form)
      const token = res.data.token
      const claims = decodeJwt(token)
      setAuth({token, user: {username: claims?.sub, role: claims?.role || 'STAFF'}})
      setMessage('Successfully logged in')
      nav('/dashboard')
    }catch(e){ setMessage('Invalid credentials') }
    finally{ setIsLoading(false) }
  }

  useEffect(()=>{
    // Load Google Identity script and render button
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true
    s.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID){
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try{
              const r = await axios.post(`${AUTH_URL}/api/auth/google`, { idToken: resp.credential })
              const token = r.data.token
              const claims = decodeJwt(token)
              setAuth({token, user: {username: claims?.sub, role: claims?.role || 'STAFF'}})
              nav('/dashboard')
            }catch(err){ setMessage('Google sign-in failed') }
          }
        })
        window.google.accounts.id.renderButton(document.getElementById('gbtn'), { theme: 'outline', size: 'large', width: 300 })
      }
    }
    document.body.appendChild(s)
    return ()=>{ document.body.removeChild(s) }
  },[])

  return (
    <div className="layout">
      <div className="sidebar">
        <h3>Welcome Back</h3>
        <p className="muted">Login to continue</p>
      </div>
      <div>
        <div className="hero"><h2>Login</h2><p>Use your account or sign in with Google</p></div>
        <div className="card">
          <div className="form-vertical">
            <input placeholder="Email or username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <button onClick={doLogin}>{isLoading ? 'Logging in…' : 'Login'}</button>
          </div>
          <div className="or"><span>or</span></div>
          <button className="google-btn" onClick={()=>window.google?.accounts?.id?.prompt?.()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.32c-1.64 4.66-6.08 8-11.32 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.16 7.94 3.06l5.66-5.66C33.14 6.18 28.8 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92z"/><path fill="#FF3D00" d="M6.31 14.69l6.58 4.82C14.35 16.46 18.83 14 24 14c3.06 0 5.84 1.16 7.94 3.06l5.66-5.66C33.14 6.18 28.8 4 24 4 16.28 4 9.66 8.22 6.31 14.69z"/><path fill="#4CAF50" d="M24 44c5.12 0 9.79-1.96 13.31-5.16l-6.14-5.2C29.13 35.78 26.7 36.6 24 36.6c-5.21 0-9.62-3.28-11.28-7.88l-6.52 5.02C9.49 39.44 16.16 44 24 44z"/><path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.32c-.78 2.21-2.22 4.15-4.02 5.55.01-.01 6.14 5.2 6.14 5.2C39.62 36.65 44 30.95 44 24c0-1.34-.14-2.65-.39-3.92z"/></svg>
            Continue with Google
          </button>
          <div id="gbtn" style={{marginTop:16}}></div>
          <p style={{marginTop:12}}>New here? <Link className="link" to="/register">Create an account</Link></p>
          {message && <div className="info" style={{marginTop:12}}>{message}</div>}
        </div>
      </div>
    </div>
  )
}

function Register({setAuth}){
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'STAFF' })
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || import.meta.env.VITE_LEAVE_URL || 'http://localhost:8081',[])
  const nav = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  useEffect(()=>{
    const ensure = ()=>{
      if (window.google && GOOGLE_CLIENT_ID){
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp)=>{
            try{
              const r = await axios.post(`${AUTH_URL}/api/auth/google`, { idToken: resp.credential })
              // on registration via Google we directly log in
              const token = r.data.token
              const claims = decodeJwt(token)
              setAuth({token, user:{username: claims?.sub, role: claims?.role || 'STAFF'}})
              nav('/dashboard')
            }catch(e){ /* ignore */ }
          }
        })
        const el = document.getElementById('gbtn-register')
        if (el){ window.google.accounts.id.renderButton(el, { theme:'outline', size:'large', width: 300 }) }
      }
    }
    if (!window.google){
      const s = document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true; s.onload=ensure; document.body.appendChild(s)
      return ()=>{ document.body.removeChild(s) }
    } else { ensure() }
  },[])
  const doRegister = async ()=>{
    setIsLoading(true); setMessage('')
    try{
      await axios.post(`${AUTH_URL}/api/auth/register`, form)
      setMessage('Account created. Please login to continue.')
      nav('/login')
    }catch(e){ setMessage('Registration failed') }
    finally{ setIsLoading(false) }
  }
  return (
    <div className="layout">
      <div className="sidebar">
        <h3>Create Account</h3>
        <p className="muted">Blue & white experience</p>
      </div>
      <div>
        <div className="hero"><h2>Register</h2><p>Choose your role</p></div>
        <div className="card">
          <div className="form-vertical">
            <input placeholder="Username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
              <option>STAFF</option>
              <option>MANAGER</option>
              <option>ADMIN</option>
            </select>
            <button onClick={doRegister}>{isLoading ? 'Creating account…' : 'Create account'}</button>
          </div>
          <div className="or"><span>or</span></div>
          <button className="google-btn" onClick={()=>window.google?.accounts?.id?.prompt?.()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.61 20.08H42V20H24v8h11.32c-1.64 4.66-6.08 8-11.32 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.16 7.94 3.06l5.66-5.66C33.14 6.18 28.8 4 24 4 16.28 4 9.66 8.22 6.31 14.69z"/><path fill="#FF3D00" d="M6.31 14.69l6.58 4.82C14.35 16.46 18.83 14 24 14c3.06 0 5.84 1.16 7.94 3.06l5.66-5.66C33.14 6.18 28.8 4 24 4 16.28 4 9.66 8.22 6.31 14.69z"/><path fill="#4CAF50" d="M24 44c5.12 0 9.79-1.96 13.31-5.16l-6.14-5.2C29.13 35.78 26.7 36.6 24 36.6c-5.21 0-9.62-3.28-11.28-7.88l-6.52 5.02C9.49 39.44 16.16 44 24 44z"/><path fill="#1976D2" d="M43.61 20.08H42V20H24v8h11.32c-.78 2.21-2.22 4.15-4.02 5.55.01-.01 6.14 5.2 6.14 5.2C39.62 36.65 44 30.95 44 24c0-1.34-.14-2.65-.39-3.92z"/></svg>
            Continue with Google
          </button>
          <div id="gbtn-register" style={{marginTop:16}}></div>
          <p style={{marginTop:12}}>Already have an account? <Link className="link" to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  )
}

function StaffDashboard({user, LEAVE_URL}){
  const [list, setList] = useState([])
  const [apply, setApply] = useState({ username: (user.username||'').trim(), type:'PTO', startDate:'', endDate:'', reason:'' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null) // selected application for view/edit
  const [edit, setEdit] = useState(null) // edit form state when editing
  const [err, setErr] = useState('')
  const [balance, setBalance] = useState(null)

  const reload = async()=>{ const r = await axios.get(`${LEAVE_URL}/api/leaves/user/${user.username}`); setList(r.data) }
  useEffect(()=>{ (async()=>{ try{ const b = await axios.get(`${LEAVE_URL}/api/leaves/balance/${user.username}`); setBalance(b.data?.balance ?? b.data?.days ?? 20) }catch{ setBalance(20) } await reload() })() },[])

  const submit = async()=>{
    setErr('')
    // Basic client-side validation to match backend @FutureOrPresent and range checks
    if (!apply.startDate || !apply.endDate) { setErr('Please select both start and end dates.'); return }
    const start = new Date(apply.startDate)
    const end = new Date(apply.endDate)
    const today = new Date(); today.setHours(0,0,0,0)
    if (start < today || end < today) { setErr('Dates cannot be in the past. Please choose today or a future date.'); return }
    if (end < start) { setErr('End date cannot be before start date.'); return }
    // Compute requested days (inclusive)
    const days = Math.floor((end - start) / (24*60*60*1000)) + 1
    if (balance != null && days > balance) { setErr(`You requested ${days} day(s) but your remaining balance is ${balance}.`); return }

    setIsSubmitting(true)
    try{
      await axios.post(`${LEAVE_URL}/api/leaves/apply`, apply)
      await reload()
      setSelected(null)
      setApply({ username: (user.username||'').trim(), type:'PTO', startDate:'', endDate:'', reason:'' })
      // Note: balance is deducted on approval; no need to refresh balance here.
    }catch(e){
      const status = e?.response?.status
      const serverMsg = e?.response?.data?.message || e?.response?.data?.error || e?.message
      if (status === 403) {
        setErr('Forbidden (403). This usually means the frontend is pointing leave requests to the Auth service or the leave-service is not deployed. Please set VITE_LEAVE_URL to your leave-service URL and redeploy the frontend.')
      } else {
        setErr(serverMsg ? `Failed to submit: ${serverMsg}` : 'Failed to submit. Please check dates and balance.')
      }
    } finally{ setIsSubmitting(false) }
  }

  const remove = async(id)=>{ await axios.delete(`${LEAVE_URL}/api/leaves/${id}`); await reload(); if(selected?.id===id){ setSelected(null); setEdit(null) } }
  const startEdit = (it)=>{ setSelected(it); setEdit({ startDate: it.startDate, endDate: it.endDate, reason: it.reason || '' }) }
  const saveEdit = async()=>{
    if (!selected) return
    try{
      await axios.put(`${LEAVE_URL}/api/leaves/${selected.id}`, null, { params: { startDate: edit.startDate, endDate: edit.endDate, reason: edit.reason } })
      await reload()
      setEdit(null)
      const updated = list.find(x=>x.id===selected.id)
      setSelected(updated || null)
    }catch(e){ setErr('Update failed. Only PENDING applications can be updated.') }
  }

  return (
    <>
      <div className="hero"><h2>Staff Dashboard</h2><p>Apply and manage your leave</p></div>
      <div className="card">
        <h3>Apply for Leave</h3>
        <div className="grid">
          <select value={apply.type} onChange={e=>setApply({...apply, type:e.target.value})}>
            <option value="PTO">Personal Time Off</option>
            <option value="SICK">Sick</option>
            <option value="COMPASSIONATE">Compassionate</option>
            <option value="MATERNITY">Maternity</option>
            <option value="OTHER">Other</option>
          </select>
          <input type="date" value={apply.startDate} onChange={e=>setApply({...apply, startDate:e.target.value})} />
          <input type="date" value={apply.endDate} onChange={e=>setApply({...apply, endDate:e.target.value})} />
          <input placeholder="Reason (optional)" value={apply.reason} onChange={e=>setApply({...apply, reason:e.target.value})} />
          <button onClick={submit} disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit'}</button>
        </div>
        {err && <div className="info" style={{marginTop:8, color:'#dc3545'}}>{err}</div>}
      </div>
      <div className="card">
        <h3>My Applications</h3>
        <ul>
          {list.map(it => (
            <li key={it.id} style={{display:'flex',gap:8,alignItems:'center',padding:'.25rem 0'}}>
              <span style={{flex:1}}>{it.type} • {it.startDate} → {it.endDate} • {it.status}</span>
              <button onClick={()=>setSelected(it)}>View</button>
              {it.status === 'PENDING' && <button onClick={()=>startEdit(it)}>Edit</button>}
              {it.status === 'PENDING' && <button onClick={()=>remove(it.id)}>Delete</button>}
            </li>
          ))}
        </ul>
        {selected && !edit && (
          <div className="card" style={{marginTop:12, background:'#f9fbff'}}>
            <h4>Application Details</h4>
            <p><b>ID:</b> {selected.id}</p>
            <p><b>Type:</b> {selected.type}</p>
            <p><b>Dates:</b> {selected.startDate} → {selected.endDate}</p>
            <p><b>Status:</b> {selected.status}</p>
            {selected.approverComment && <p><b>Manager Comment:</b> {selected.approverComment}</p>}
            <button onClick={()=>setSelected(null)}>Close</button>
          </div>
        )}
        {edit && selected && (
          <div className="card" style={{marginTop:12}}>
            <h4>Edit Application (PENDING)</h4>
            <div className="grid">
              <input type="date" value={edit.startDate} onChange={e=>setEdit({...edit, startDate:e.target.value})} />
              <input type="date" value={edit.endDate} onChange={e=>setEdit({...edit, endDate:e.target.value})} />
              <input placeholder="Reason (optional)" value={edit.reason} onChange={e=>setEdit({...edit, reason:e.target.value})} />
              <button onClick={saveEdit}>Save</button>
              <button onClick={()=>setEdit(null)} style={{background:'#6c757d'}}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function ManagerDashboard({LEAVE_URL}){
  const [pending, setPending] = useState([])
  const [selected, setSelected] = useState(null)
  const reload = async()=>{ const r = await axios.get(`${LEAVE_URL}/api/leaves`); setPending(r.data.filter(x=>x.status==='PENDING')) }
  useEffect(()=>{ reload() },[])
  const act = async(id, status)=>{ await axios.post(`${LEAVE_URL}/api/leaves/approve/${id}?status=${status}`); await reload(); if(selected?.id===id){ setSelected(null) } }
  return (
    <>
      <div className="hero"><h2>Manager Dashboard</h2><p>Review and approve requests</p></div>
      <div className="card">
        <ul>
          {pending.map(it => (
            <li key={it.id} style={{display:'flex',gap:8,alignItems:'center',padding:'.25rem 0'}}>
              <span style={{flex:1}}>{it.username} • {it.type} • {it.startDate} → {it.endDate}</span>
              <button onClick={()=>setSelected(it)}>View</button>
              <button onClick={()=>act(it.id,'APPROVED')}>Approve</button>
              <button onClick={()=>act(it.id,'REJECTED')}>Reject</button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className="card" style={{marginTop:12, background:'#f9fbff'}}>
            <h4>Application Details</h4>
            <p><b>ID:</b> {selected.id}</p>
            <p><b>User:</b> {selected.username}</p>
            <p><b>Type:</b> {selected.type}</p>
            <p><b>Dates:</b> {selected.startDate} → {selected.endDate}</p>
            <p><b>Status:</b> {selected.status}</p>
            {selected.reason && <p><b>Reason:</b> {selected.reason}</p>}
            <button onClick={()=>setSelected(null)}>Close</button>
          </div>
        )}
      </div>
    </>
  )
}

function AdminDashboard({LEAVE_URL}){
  const [stats, setStats] = useState({approved:0, pending:0, rejected:0})
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState(null)
  useEffect(()=>{
    const load = async()=>{
      const r = await axios.get(`${LEAVE_URL}/api/leaves`)
      setAll(r.data)
      const approved = r.data.filter(x=>x.status==='APPROVED').length
      const pending = r.data.filter(x=>x.status==='PENDING').length
      const rejected = r.data.filter(x=>x.status==='REJECTED').length
      setStats({approved,pending,rejected})
    }; load()
  },[])
  return (
    <>
      <div className="hero"><h2>Admin Dashboard</h2><p>System overview</p></div>
      <div className="grid">
        <div className="card"><h3>Approved</h3><p style={{fontSize:28,fontWeight:800,color:'var(--primary)'}}>{stats.approved}</p></div>
        <div className="card"><h3>Pending</h3><p style={{fontSize:28,fontWeight:800,color:'#ff8800'}}>{stats.pending}</p></div>
        <div className="card"><h3>Rejected</h3><p style={{fontSize:28,fontWeight:800,color:'#dc3545'}}>{stats.rejected}</p></div>
      </div>
      <div className="card" style={{marginTop:12}}>
        <h3>All Applications</h3>
        <ul>
          {all.map(it => (
            <li key={it.id} style={{display:'flex',gap:8,alignItems:'center',padding:'.25rem 0'}}>
              <span style={{flex:1}}>{it.username} • {it.type} • {it.startDate} → {it.endDate} • {it.status}</span>
              <button onClick={()=>setSelected(it)}>View</button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className="card" style={{marginTop:12, background:'#f9fbff'}}>
            <h4>Application Details</h4>
            <p><b>ID:</b> {selected.id}</p>
            <p><b>User:</b> {selected.username}</p>
            <p><b>Type:</b> {selected.type}</p>
            <p><b>Dates:</b> {selected.startDate} → {selected.endDate}</p>
            <p><b>Status:</b> {selected.status}</p>
            {selected.reason && <p><b>Reason:</b> {selected.reason}</p>}
            {selected.approverComment && <p><b>Manager Comment:</b> {selected.approverComment}</p>}
            <button onClick={()=>setSelected(null)}>Close</button>
          </div>
        )}
      </div>
    </>
  )
}

export default function App(){
  const [auth, setAuth] = useState({ token:'', user:null })
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || import.meta.env.VITE_LEAVE_URL || 'http://localhost:8081',[])
  const LEAVE_URL = useMemo(()=>import.meta.env.VITE_LEAVE_URL || import.meta.env.VITE_AUTH_URL || 'http://localhost:8082',[])
  const logout = ()=> setAuth({token:'', user:null})

  return (
    <BrowserRouter>
      <Layout token={auth.token} onLogout={logout}>
        <Routes>
          <Route path="/" element={<div className="hero"><h2>Leave Management</h2><p>Blue & white platform with Auth and Google OAuth</p></div>} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register setAuth={setAuth} />} />
          <Route path="/dashboard" element={
            auth.user ? (
              auth.user.role === 'ADMIN' ? <AdminDashboard LEAVE_URL={LEAVE_URL}/> :
              auth.user.role === 'MANAGER' ? <ManagerDashboard LEAVE_URL={LEAVE_URL}/> :
              <StaffDashboard user={auth.user} LEAVE_URL={LEAVE_URL}/>
            ) : <div className="card">Please <Link className="link" to="/login">login</Link>.</div>
          } />
        </Routes>
        <div className="footer">
          <a href={`${AUTH_URL}/swagger-ui/index.html`} target="_blank">Auth Swagger</a>
          <a href={`${LEAVE_URL}/swagger-ui/index.html`} target="_blank">Leave Swagger</a>
        </div>
      </Layout>
    </BrowserRouter>
  )
}
