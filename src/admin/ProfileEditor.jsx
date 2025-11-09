// src/admin/ProfileEditor.jsx
import React, { useEffect, useState } from 'react'
import { useProfileRealtime } from '../utils/useFirestore'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function ProfileEditor(){
  const [profile, saveProfile] = useProfileRealtime()
  const [isAdmin, setIsAdmin] = useState(false)

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u => setIsAdmin(!!u))
    return unsub
  },[])

  useEffect(()=>{
    setName(profile?.name || '')
    setTitle(profile?.title || '')
    setBio(profile?.bio || '')
  }, [profile])

  const handleSave = async () => {
    setLoadingSave(true)
    try{
      await saveProfile({ name, title, bio })
      window.alert('Profile disimpan')
    }catch(err){
      console.error(err)
      window.alert('Simpan profile gagal: ' + err.message)
    }finally{
      setLoadingSave(false)
    }
  }

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    if(!f) return
    if(!CLOUD_NAME || !UPLOAD_PRESET) return alert('Cloudinary belum dikonfigurasi')
    setLoadingUpload(true)
    try{
      const fd = new FormData(); fd.append('file', f); fd.append('upload_preset', UPLOAD_PRESET)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method:'POST', body: fd })
      const j = await res.json()
      if(j.secure_url){
        await saveProfile({ photo: j.secure_url })
        window.alert('Foto profil terupload')
      } else {
        console.error(j)
        window.alert('Upload gambar gagal')
      }
    }catch(err){
      console.error(err)
      window.alert('Upload error: ' + err.message)
    }finally{
      setLoadingUpload(false)
    }
  }

  if(!isAdmin) return <div className="card">Silakan login di <a href="/admin" className="text-indigo-400">halaman admin</a>.</div>

  return (
    <div className="card">
      <h4 className="font-semibold">Edit Profile</h4>
      <div className="mt-3 grid md:grid-cols-2 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} className="p-2 rounded bg-[#071024]" placeholder="Nama" />
        <input value={title} onChange={e=>setTitle(e.target.value)} className="p-2 rounded bg-[#071024]" placeholder="Title" />
        <textarea value={bio} onChange={e=>setBio(e.target.value)} className="md:col-span-2 p-2 rounded bg-[#071024]" placeholder="Bio" />
        <div>
          <label className="text-sm text-gray-300">Upload Foto Profil</label>
          <input type="file" accept="image/*" onChange={onFile} />
          {loadingUpload && <div className="text-sm text-gray-400 mt-1">Uploading...</div>}
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 rounded" disabled={loadingSave}>{loadingSave ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
