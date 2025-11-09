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
    <section className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 min-h-[85vh]">
      {/* Foto Profil */}
      <div className="relative group">
        {/* Efek binar bergerak */}
        <div className="absolute inset-0 rounded-full animate-spin-slow bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>

        {/* Border + foto */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full p-[3px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl overflow-hidden">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0f172a]">
            {profile?.photo ? (
              <img src={profile.photo} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
            )}
          </div>
        </div>
      </div>

      {/* Informasi Profil */}
      <div className="text-center md:text-left max-w-xl">
        {!editing ? (
          <>
            <h1 className="text-4xl md:text-5xl font-bold">{profile?.name || 'Nama Kamu'}</h1>
            <p className="text-indigo-300 mt-1 text-lg md:text-xl">{profile?.title || 'Frontend Developer'}</p>
            <p className="mt-4 text-gray-300 leading-relaxed">
              {profile?.shortBio || 'Tambahkan deskripsi singkat tentang dirimu di halaman ini.'}
            </p>

            {isAdmin && (
              <div className="mt-5 flex flex-col md:flex-row items-center gap-3 md:justify-start justify-center">
                <button onClick={()=>setEditing(true)} className="px-5 py-2 bg-indigo-600 rounded">Edit Profile</button>
                <label className="text-sm text-gray-300 cursor-pointer">
                  Ganti Foto
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>
                {loading && <div className="text-sm text-gray-400">Uploading...</div>}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <input className="p-2 rounded bg-[#071024]" value={name} onChange={e=>setName(e.target.value)} placeholder="Nama" />
            <input className="p-2 rounded bg-[#071024]" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
            <textarea className="p-2 rounded bg-[#071024]" value={shortBio} onChange={e=>setShortBio(e.target.value)} placeholder="Deskripsi singkat" />
            <div className="flex gap-2 justify-center md:justify-start mt-3">
              <button onClick={save} className="px-4 py-2 bg-green-600 rounded">Simpan</button>
              <button onClick={()=>setEditing(false)} className="px-4 py-2 border rounded">Batal</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
