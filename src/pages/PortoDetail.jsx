// src/pages/PortoDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, useSkillsRealtime } from '../utils/useFirestore'

export default function PortoDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [skills] = useSkillsRealtime()

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      setLoading(true)
      const p = await getProjectById(id)
      if(mounted) {
        setProject(p)
        setIndex(0)
        setLoading(false)
      }
    })()
    return ()=>{ mounted = false }
  }, [id])

  if(loading) return <div>Loading...</div>
  if(!project) return <div className="text-gray-400">Project tidak ditemukan <button onClick={()=>navigate(-1)} className="ml-2 underline">Kembali</button></div>

  const images = project.images || []
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length)
  const next = () => setIndex(i => (i + 1) % images.length)

  const getSkillById = (id) => skills.find(s => s.id === id)

  return (
    <div>
      <button className="text-sm text-gray-400 mb-4" onClick={()=>navigate(-1)}>← Kembali</button>
      <div className="card">
        {images.length > 0 ? (
          <div>
            <div className="relative">
              <img src={images[index]} alt={`${project.title} ${index+1}`} className="w-full h-64 object-cover rounded mb-3" />
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full">‹</button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full">›</button>
                </>
              )}
            </div>
            <div className="flex gap-2 items-center overflow-x-auto mb-3">
              {images.map((src, i) => (
                <button key={i} onClick={()=>setIndex(i)} className={`w-16 h-12 rounded overflow-hidden border ${i===index ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={src} className="w-full h-full object-cover" alt={`thumb-${i}`} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-64 bg-[#071024] rounded mb-3 flex items-center justify-center text-gray-500">No images</div>
        )}

        <h3 className="text-2xl font-bold mt-4">{project.title}</h3>
        <p className="text-gray-300 mt-2">{project.desc}</p>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Tech Stack</h4>
          <div className="flex gap-2 flex-wrap">
            {(project.techStack || []).map(id => {
              const s = getSkillById(id)
              if(!s) return null
              return s.image ? (
                <div key={id} className="flex items-center gap-2 bg-[#0f1720] px-2 py-1 rounded">
                  <img src={s.image} alt={s.name} className="w-6 h-6 object-contain" />
                  <span className="text-sm text-gray-200">{s.name}</span>
                </div>
              ) : (
                <div key={id} className="px-2 py-1 bg-[#0f1720] rounded text-sm">{s.name}</div>
              )
            })}
            {(!project.techStack || project.techStack.length===0) && <div className="text-gray-400">Belum ada tech stack untuk project ini.</div>}
          </div>
        </div>

        {project.link && <a href={project.link} className="text-indigo-400 mt-3 inline-block" target="_blank" rel="noreferrer">Lihat project</a>}
      </div>
    </div>
  )
}
