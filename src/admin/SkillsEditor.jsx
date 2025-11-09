// src/admin/SkillsEditor.jsx
import React, { useEffect, useState } from 'react'
import { useSkillsRealtime } from '../utils/useFirestore'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function SkillsEditor(){
  const [skills, addSkill, removeSkill] = useSkillsRealtime()
  const [isAdmin, setIsAdmin] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [loadingAdd, setLoadingAdd] = useState(false)

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, u => setIsAdmin(!!u))
    return unsub
  },[])

  const handleAdd = async () => {
    if(!name) return window.alert('Masukkan nama skill')
    setLoadingAdd(true)
    try {
      let imageUrl = null
      if(file){
        if(!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary belum dikonfigurasi')
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET)
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: fd })
        const j = await res.json()
        if(j.secure_url) imageUrl = j.secure_url
        else throw new Error('Upload gambar skill gagal')
      }
      await addSkill({ name: name.trim(), image: imageUrl || null })
      window.alert('Skill berhasil ditambahkan')
      setName(''); setFile(null)
    } catch(err){
      console.error(err); window.alert('Gagal menambah skill: ' + (err.message||err))
    } finally {
      setLoadingAdd(false)
    }
  }

  const handleRemove = async (id) => {
    if(!confirm('Hapus skill ini?')) return
    try{
      await removeSkill(id)
      window.alert('Skill dihapus')
    }catch(err){
      console.error(err); window.alert('Gagal menghapus skill: ' + err.message)
    }
  }

  if(!isAdmin) return <div className="card">Silakan login di <a href="/admin" className="text-indigo-400">halaman admin</a>.</div>

  return (
    <div className="card">
      <h4 className="font-semibold">Manage Skills (with Image)</h4>

      <div className="mt-3 grid md:grid-cols-3 gap-2 items-end">
        <input value={name} onChange={e=>setName(e.target.value)} className="p-2 rounded bg-[#071024] md:col-span-1" placeholder="Nama skill" />
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} className="p-2 md:col-span-1" />
        <div className="md:col-span-1 flex justify-end">
          <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 rounded" disabled={loadingAdd}>{loadingAdd ? 'Adding...' : 'Add Skill'}</button>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        {skills.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-700 rounded">
            <div className="w-14 h-14 bg-[#071024] rounded overflow-hidden flex items-center justify-center">
              {s.image ? <img src={s.image} className="w-full h-full object-cover" alt={s.name} /> : <div className="text-xs text-gray-400">No image</div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-gray-500">ID: {s.id}</div>
            </div>
            <div>
              <button onClick={()=>handleRemove(s.id)} className="text-sm text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
