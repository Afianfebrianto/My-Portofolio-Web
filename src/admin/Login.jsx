// src/admin/Login.jsx
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const tryLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      await signInWithEmailAndPassword(auth, email, pw)
      sessionStorage.setItem('vc_admin','1') // optional fallback
      window.alert('Login berhasil')
      navigate('/admin/profile')
    }catch(err){
      console.error(err)
      window.alert('Login gagal: ' + (err.message || err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card">
      <h3 className="font-semibold">Admin Login</h3>
      <form onSubmit={tryLogin} className="mt-4 space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 rounded bg-[#071024] border border-[#0e1724]" required />
        <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" type="password" className="w-full p-2 rounded bg-[#071024] border border-[#0e1724]" required />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-indigo-600 rounded" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
      <div className="mt-3 text-sm text-gray-400">Gunakan akun admin yang sudah dibuat di Firebase Auth.</div>
    </div>
  )
}
