// src/pages/Home.jsx
import React, { useEffect, useState } from 'react'
import { useProfileRealtime } from '../utils/useFirestore'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function Home(){
  const [profile, saveProfile] = useProfileRealtime()
  const [isAdmin, setIsAdmin] = useState(false)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, user => setIsAdmin(!!user))
    return unsub
  },[])

  useEffect(()=>{
    setName(profile?.name || '')
    setTitle(profile?.title || '')
    setShortBio(profile?.shortBio || '')
  }, [profile])

  const save = async () => {
    await saveProfile({ name, title, shortBio })
    window.alert('Profile updated')
    setEditing(false)
  }

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    if(!f) return
    setLoading(true)
    try{
      const fd = new FormData()
      fd.append('file', f)
      fd.append('upload_preset', UPLOAD_PRESET)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: fd })
      const j = await res.json()
      if(j.secure_url){
        await saveProfile({ photo: j.secure_url })
        window.alert('Foto diperbarui')
      } else alert('Upload gagal')
    }catch(err){ alert('Upload error: ' + err.message) }
    finally{ setLoading(false) }
  }

  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 min-h-[85vh] px-6">
      {/* Foto Profil */}
      <div className="relative group flex-shrink-0">
        {/* subtle glowing / float wrapper */}
        <div className="glow-wrap">
          <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full p-[4px] gradient-border overflow-hidden shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0f172a]">
              {profile?.photo ? (
                <img src={profile.photo} alt="profile" className="w-full h-full object-cover profile-float" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No photo</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Profil */}
      <div className="text-center md:text-left max-w-2xl">
        {!editing ? (
          <>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-fade-up" style={{animationDelay: '0.12s'}}>
              {profile?.name || 'Nama Kamu'}
            </h1>

            <p className="text-indigo-300 mt-2 text-xl md:text-2xl font-medium animate-fade-up" style={{animationDelay: '0.24s'}}>
              {profile?.title || 'Frontend Developer'}
            </p>

            <p className="mt-5 text-gray-300 leading-relaxed text-lg md:text-xl animate-fade-up" style={{animationDelay: '0.36s'}}>
              {profile?.shortBio || 'Tambahkan deskripsi singkat tentang dirimu di halaman ini.'}
            </p>

            {isAdmin && (
              <div className="mt-6 flex flex-col md:flex-row items-center gap-3 md:justify-start justify-center animate-fade-up" style={{animationDelay: '0.48s'}}>
                <button onClick={()=>setEditing(true)} className="px-6 py-3 bg-indigo-600 rounded-lg text-sm md:text-base shadow-lg transform hover:-translate-y-0.5 transition">
                  Edit Profile
                </button>

                <label className="text-sm text-gray-300 cursor-pointer flex items-center gap-2">
                  <span className="underline">Ganti Foto</span>
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>

                {loading && <div className="text-sm text-gray-400">Uploading...</div>}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-lg animate-fade-up" style={{animationDelay: '0.12s'}}>
            <input className="p-3 rounded bg-[#071024]" value={name} onChange={e=>setName(e.target.value)} placeholder="Nama" />
            <input className="p-3 rounded bg-[#071024]" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
            <textarea className="p-3 rounded bg-[#071024]" value={shortBio} onChange={e=>setShortBio(e.target.value)} placeholder="Deskripsi singkat" rows={4} />
            <div className="flex gap-3 justify-center md:justify-start mt-3">
              <button onClick={save} className="px-5 py-2 bg-green-600 rounded-lg">Simpan</button>
              <button onClick={()=>setEditing(false)} className="px-5 py-2 border rounded-lg">Batal</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
