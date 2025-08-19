import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { decodeJwt } from './auth'

function Layout({children, token, onLogout}){
  return (
    <>
      <header>
        <div className="nav">
          <div className="logo"><span className="dot"/><h1>SheCanCode LMS</h1></div>
          <nav>
            <Link className="link" to="/login">Login</Link>{' '}
            <Link className="link" to="/register" style={{marginLeft:12}}>Register</Link>
            {token && <button style={{marginLeft:12}} onClick={onLogout}>Logout</button>}
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
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || 'http://localhost:8081',[])
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const nav = useNavigate()

  const doLogin = async ()=>{
    try{
      const res = await axios.post(`${AUTH_URL}/api/auth/login`, form)
      const token = res.data.token
      const claims = decodeJwt(token)
      setAuth({token, user: {username: claims?.sub, role: claims?.role || 'STAFF'}})
      nav('/dashboard')
    }catch(e){ setMessage('Invalid credentials') }
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
          <div className="grid">
            <input placeholder="Email or username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <button onClick={doLogin}>Login</button>
          </div>
          <div id="gbtn" style={{marginTop:16}}></div>
          {message && <div className="info" style={{marginTop:12}}>{message}</div>}
        </div>
      </div>
    </div>
  )
}

function Register({setAuth}){
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'STAFF' })
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || 'http://localhost:8081',[])
  const nav = useNavigate()
  const doRegister = async ()=>{
    const res = await axios.post(`${AUTH_URL}/api/auth/register`, form)
    const token = res.data.token
    const claims = decodeJwt(token)
    setAuth({token, user: {username: claims?.sub, role: form.role}})
    nav('/dashboard')
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
          <div className="grid">
            <input placeholder="Username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} />
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
              <option>STAFF</option>
              <option>MANAGER</option>
              <option>ADMIN</option>
            </select>
            <button onClick={doRegister}>Create account</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StaffDashboard({user, LEAVE_URL}){
  const [list, setList] = useState([])
  const [apply, setApply] = useState({ username: user.username, type:'PTO', startDate:'', endDate:'', reason:'' })
  const reload = async()=>{ const r = await axios.get(`${LEAVE_URL}/api/leaves/user/${user.username}`); setList(r.data) }
  useEffect(()=>{ reload() },[])
  const submit = async()=>{ await axios.post(`${LEAVE_URL}/api/leaves/apply`, apply); await reload() }
  const remove = async(id)=>{ await axios.delete(`${LEAVE_URL}/api/leaves/${id}`); await reload() }
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
          <button onClick={submit}>Submit</button>
        </div>
      </div>
      <div className="card">
        <h3>My Applications</h3>
        <ul>
          {list.map(it => (
            <li key={it.id} style={{display:'flex',justifyContent:'space-between',padding:'.25rem 0'}}>
              <span>{it.type} • {it.startDate} → {it.endDate} • {it.status}</span>
              {it.status === 'PENDING' && <button onClick={()=>remove(it.id)}>Delete</button>}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function ManagerDashboard({LEAVE_URL}){
  const [pending, setPending] = useState([])
  const reload = async()=>{ const r = await axios.get(`${LEAVE_URL}/api/leaves`); setPending(r.data.filter(x=>x.status==='PENDING')) }
  useEffect(()=>{ reload() },[])
  const act = async(id, status)=>{ await axios.post(`${LEAVE_URL}/api/leaves/approve/${id}?status=${status}`); await reload() }
  return (
    <>
      <div className="hero"><h2>Manager Dashboard</h2><p>Review and approve requests</p></div>
      <div className="card">
        <ul>
          {pending.map(it => (
            <li key={it.id} style={{display:'flex',gap:8,alignItems:'center',padding:'.25rem 0'}}>
              <span style={{flex:1}}>{it.username} • {it.type} • {it.startDate} → {it.endDate}</span>
              <button onClick={()=>act(it.id,'APPROVED')}>Approve</button>
              <button onClick={()=>act(it.id,'REJECTED')}>Reject</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function AdminDashboard({LEAVE_URL}){
  const [stats, setStats] = useState({approved:0, pending:0, rejected:0})
  useEffect(()=>{
    const load = async()=>{
      const r = await axios.get(`${LEAVE_URL}/api/leaves`)
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
    </>
  )
}

export default function App(){
  const [auth, setAuth] = useState({ token:'', user:null })
  const AUTH_URL = useMemo(()=>import.meta.env.VITE_AUTH_URL || 'http://localhost:8081',[])
  const LEAVE_URL = useMemo(()=>import.meta.env.VITE_LEAVE_URL || 'http://localhost:8082',[])
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
          <a href={`${AUTH_URL}/swagger-ui.html`} target="_blank">Auth Swagger</a>
          <a href={`${LEAVE_URL}/swagger-ui.html`} target="_blank">Leave Swagger</a>
        </div>
      </Layout>
    </BrowserRouter>
  )
}
