// src/pages/About.jsx
import React, { useEffect, useState } from 'react'
import { useProfileRealtime, useSkillsRealtime } from '../utils/useFirestore'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function About(){
  const [profile, saveProfile] = useProfileRealtime()
  const [skills, addSkill, removeSkill] = useSkillsRealtime()
  const [isAdmin, setIsAdmin] = useState(false)

  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')

  const [skillName, setSkillName] = useState('')
  const [file, setFile] = useState(null)
  const [loadingAdd, setLoadingAdd] = useState(false)

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, user => setIsAdmin(!!user))
    return unsub
  },[])

  useEffect(()=>{ setBioDraft(profile?.bio || '') }, [profile])

  const saveBio = async () => {
    await saveProfile({ bio: bioDraft })
    setEditingBio(false)
    window.alert('Bio berhasil disimpan')
  }

  const addNewSkill = async () => {
    if(!skillName) return window.alert('Isi nama skill dulu')
    setLoadingAdd(true)
    try{
      let imageUrl = null
      if(file){
        const fd = new FormData()
        fd.append('file', file)
        fd.append('upload_preset', UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
          method: 'POST',
          body: fd
        })
        const j = await res.json()
        if(j.secure_url) imageUrl = j.secure_url
      }
      await addSkill({ name: skillName.trim(), image: imageUrl || null })
      setSkillName('')
      setFile(null)
      window.alert('Skill ditambahkan')
    }catch(err){
      console.error(err)
      window.alert('Gagal menambah skill: ' + err.message)
    }finally{
      setLoadingAdd(false)
    }
  }

  const removeSkillHandler = async (id) => {
    if(!confirm('Hapus skill ini?')) return
    await removeSkill(id)
    window.alert('Skill dihapus')
  }

  return (
    <div>
      {/* --- About Section --- */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">About Me</h2>
          {!editingBio ? (
            <p className="mt-3 text-gray-300 whitespace-pre-line">{profile?.bio || 'Belum ada bio. Login admin untuk menambah.'}</p>
          ) : (
            <div className="mt-3">
              <textarea className="w-full p-2 rounded bg-[#071024]" value={bioDraft} onChange={e=>setBioDraft(e.target.value)} />
              <div className="flex gap-2 justify-end mt-2">
                <button onClick={saveBio} className="px-4 py-2 bg-green-600 rounded">Simpan</button>
                <button onClick={()=>{ setEditingBio(false); setBioDraft(profile?.bio || '') }} className="px-4 py-2 border rounded">Batal</button>
              </div>
            </div>
          )}
        </div>

        {isAdmin && !editingBio && (
          <div>
            <button onClick={()=>setEditingBio(true)} className="px-3 py-1 bg-indigo-600 rounded">Edit Bio</button>
          </div>
        )}
      </div>

      {/* --- Skills Section --- */}
      <h3 className="mt-10 text-2xl font-bold">Tech Stack</h3>

      {isAdmin && (
        <div className="mt-4 grid md:grid-cols-3 gap-2 items-end">
          <input value={skillName} onChange={e=>setSkillName(e.target.value)} className="p-2 rounded bg-[#071024]" placeholder="Nama Skill" />
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} className="p-2" />
          <button onClick={addNewSkill} className="px-4 py-2 bg-indigo-600 rounded" disabled={loadingAdd}>
            {loadingAdd ? 'Uploading...' : 'Tambah'}
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {skills.map((s)=>(
          <div key={s.id} className="relative group flex flex-col items-center">
            <div className="w-16 h-16 rounded-lg bg-[#0f1720] flex items-center justify-center overflow-hidden border border-[#1e293b]">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-gray-400 text-xs">{s.name}</span>
              )}
            </div>
            <span className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition">{s.name}</span>
            {isAdmin && (
              <button
                onClick={()=>removeSkillHandler(s.id)}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {skills.length === 0 && <div className="text-gray-400 mt-2 col-span-full">Belum ada tech stack</div>}
      </div>
    </div>
  )
}
