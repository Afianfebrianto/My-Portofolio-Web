// src/admin/ProjectsEditor.jsx
import React, { useEffect, useState } from 'react'
import { useProjectsRealtime } from '../utils/useFirestore'
import { useSkillsRealtime } from '../utils/useFirestore'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export default function ProjectsEditor(){
  const [projects, addProject, updateProject, removeProject] = useProjectsRealtime()
  const [skills] = useSkillsRealtime() // read-only list of available skills
  const [isAdmin, setIsAdmin] = useState(false)

  const [form, setForm] = useState({ title:'', short:'', desc:'', link:'', files: [], techStack: [] })
  const [loadingAdd, setLoadingAdd] = useState(false)

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, u => setIsAdmin(!!u))
    return unsub
  },[])

  const uploadFilesToCloudinary = async (files) => {
    const urls = []
    for (let i = 0; i < files.length; i++){
      const f = files[i]
      const fd = new FormData()
      fd.append('file', f)
      fd.append('upload_preset', UPLOAD_PRESET)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: fd })
      const j = await res.json()
      if(j.secure_url) urls.push(j.secure_url)
      else throw new Error('Gagal upload salah satu file')
    }
    return urls
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if(!form.title || !form.short || !form.desc) return window.alert('Lengkapi field judul/short/desc')
    setLoadingAdd(true)
    try {
      let images = []
      if(form.files && form.files.length > 0){
        if(!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary belum dikonfigurasi')
        images = await uploadFilesToCloudinary(Array.from(form.files))
      }
      // techStack is array of skill ids
      await addProject({ title: form.title, short: form.short, desc: form.desc, link: form.link || '', images, techStack: form.techStack || [] })
      window.alert('Project berhasil ditambahkan')
      setForm({ title:'', short:'', desc:'', link:'', files: [], techStack: [] })
    } catch(err){
      console.error(err)
      window.alert('Gagal menambah project: ' + (err.message || err))
    } finally {
      setLoadingAdd(false)
    }
  }

  const handleDelete = async (id) => {
    if(!confirm('Hapus project ini?')) return
    try{
      await removeProject(id)
      window.alert('Project dihapus')
    }catch(err){
      console.error(err)
      window.alert('Gagal menghapus project: ' + err.message)
    }
  }

  const toggleSkill = (skillId) => {
    setForm(f => {
      const exists = f.techStack.includes(skillId)
      return { ...f, techStack: exists ? f.techStack.filter(x=>x !== skillId) : [...f.techStack, skillId] }
    })
  }

  if(!isAdmin) return <div className="card">Silakan login di <a href="/admin" className="text-indigo-400">halaman admin</a>.</div>

  return (
    <div className="card">
      <h4 className="font-semibold">Manage Projects (with Tech Stack)</h4>

      <form onSubmit={handleAdd} className="mt-3 grid md:grid-cols-2 gap-2">
        <input value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} placeholder="Title" className="p-2 rounded bg-[#071024]" />
        <input value={form.short} onChange={e=>setForm(f=>({...f, short: e.target.value}))} placeholder="Short" className="p-2 rounded bg-[#071024]" />
        <textarea value={form.desc} onChange={e=>setForm(f=>({...f, desc: e.target.value}))} className="md:col-span-2 p-2 rounded bg-[#071024]" placeholder="Deskripsi" />
        <input value={form.link} onChange={e=>setForm(f=>({...f, link: e.target.value}))} placeholder="Link (opsional)" className="p-2 rounded bg-[#071024]" />
        <input type="file" accept="image/*" multiple onChange={e=>setForm(f=>({...f, files: e.target.files || [] }))} />
        <div className="md:col-span-2">
          <div className="text-sm text-gray-300 mb-2">Pilih Tech Stack untuk project ini:</div>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => {
              const selected = form.techStack.includes(s.id)
              return (
                <button key={s.id} type="button" onClick={()=>toggleSkill(s.id)}
                  className={`px-3 py-1 rounded border ${selected ? 'bg-indigo-600 text-white' : 'bg-[#071024] text-gray-300'}`}>
                  {s.image ? <img src={s.image} alt={s.name} className="inline-block w-5 h-5 mr-2 object-contain align-middle" /> : null}
                  <span className="align-middle text-sm">{s.name}</span>
                </button>
              )
            })}
            {skills.length === 0 && <div className="text-gray-400">Belum ada skill. Tambah skill di menu Skills dulu.</div>}
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button className="px-4 py-2 bg-green-600 rounded" disabled={loadingAdd}>{loadingAdd ? 'Adding...' : 'Add'}</button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {projects.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-700 rounded">
            <div className="w-20 h-14 bg-[#071024] rounded overflow-hidden">
              {p.images && p.images.length > 0 ? <img src={p.images[0]} className="w-full h-full object-cover" alt={p.title} /> : <div className="text-gray-500 text-xs p-2">No image</div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-[#94a3b8]">{p.short}</div>
              <div className="mt-2 flex gap-2 items-center">
                {(p.techStack || []).map(id => {
                  const s = skills.find(x=>x.id===id)
                  return s ? (
                    <div key={id} className="flex items-center gap-1 text-xs bg-[#0f1720] px-2 py-1 rounded">
                      {s.image ? <img src={s.image} alt={s.name} className="w-4 h-4 object-contain" /> : <span className="text-gray-300">{s.name}</span>}
                    </div>
                  ) : null
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`/porto/${p.id}`} className="text-sm underline">View</a>
              <button onClick={()=>handleDelete(p.id)} className="text-sm text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
