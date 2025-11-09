// src/admin/AdminShell.jsx
import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './Login'
import ProfileEditor from './ProfileEditor'
import ProjectsEditor from './ProjectsEditor'
import SkillsEditor from './SkillsEditor'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function AdminShell(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      // if not logged in and currently at a nested admin route, navigate to /admin (login)
      // we don't force navigate here to avoid conflict; components handle access
    })
    return unsub
  },[])

  const handleLogout = async () => {
    try{
      await signOut(auth)
      sessionStorage.removeItem('vc_admin') // fallback
      setUser(null)
      navigate('/')
      window.alert('Logout berhasil')
    }catch(err){
      console.error(err)
      window.alert('Logout gagal: ' + err.message)
    }
  }

  // If not authenticated, show Login route only
  return (
    <div>
      <div className="card mb-4 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="font-semibold text-lg">Admin Panel</div>
          <nav className="flex gap-2">
            <Link to="/admin/profile" className="text-sm">Profile</Link>
            <Link to="/admin/projects" className="text-sm">Projects</Link>
            <Link to="/admin/skills" className="text-sm">Skills</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm text-gray-300">{user.email}</div>
              <button onClick={handleLogout} className="px-3 py-1 bg-red-600 rounded text-sm">Logout</button>
            </>
          ) : (
            <Link to="/admin" className="px-3 py-1 bg-indigo-600 rounded text-sm">Login</Link>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/profile" element={<Protected><ProfileEditor/></Protected>} />
        <Route path="/projects" element={<Protected><ProjectsEditor/></Protected>} />
        <Route path="/skills" element={<Protected><SkillsEditor/></Protected>} />
      </Routes>
    </div>
  )
}

// Protected wrapper: redirects to /admin (login) if not authenticated
function Protected({ children }){
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u => {
      if(!u){
        navigate('/admin') // go to login
      } else {
        setAuthed(true)
      }
    })
    return unsub
    // eslint-disable-next-line
  },[])

  if(!authed) return <div className="card">Checking authentication...</div>
  return children
}
