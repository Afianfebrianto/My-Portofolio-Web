// src/components/Nav.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useProfileRealtime } from '../utils/useFirestore'

export default function Nav(){
  const [profile] = useProfileRealtime() // realtime profile: { name, title, photo }

  const name = profile?.name || 'Your Name'
  const title = profile?.title || 'Frontend Developer'
  const initial = (name || 'Y').split(' ').map(s => s[0] || '').slice(0,2).join('').toUpperCase()

  return (
    <header className="bg-[#071024] border-b border-[#0e1724]">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold">
            {profile?.photo ? (
              <img src={profile.photo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                {initial}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-[#94a3b8]">{title}</div>
          </div>
        </Link>

        <nav className="flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/porto">Portofolio</Link>
          {/* <Link to="/admin">Admin</Link> */}
        </nav>
      </div>
    </header>
  )
}
