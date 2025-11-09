// src/pages/Porto.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useProjectsRealtime } from '../utils/useFirestore'
import { useSkillsRealtime } from '../utils/useFirestore'

export default function Porto(){
  const [projects] = useProjectsRealtime()
  const [skills] = useSkillsRealtime()

  const getSkillById = (id) => skills.find(s => s.id === id)

  return (
    <div>
      <h2 className="text-3xl font-bold">Portofolio</h2>

      <div className="mt-6 grid sm:grid-cols-2 gap-6">
        {projects.map(p => (
          <Link
            to={`/porto/${p.id}`}
            key={p.id}
            className="block transform transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
            aria-label={`Buka detail project ${p.title}`}
          >
            <div className="card h-full flex gap-4">
              <div className="w-36 h-24 flex-shrink-0 rounded overflow-hidden bg-[#071024]">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-500 text-sm p-2">No image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-[#94a3b8] mt-1">{p.short}</div>

                <div className="text-xs text-gray-400 mt-2 line-clamp-3" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {p.desc}
                </div>

                <div className="mt-3 flex gap-2 items-center">
                  {(p.techStack || []).map(id => {
                    const s = getSkillById(id)
                    if(!s) return null
                    return s.image ? (
                      <img key={id} src={s.image} alt={s.name} title={s.name} className="w-6 h-6 object-contain rounded" />
                    ) : (
                      <div key={id} className="px-2 py-1 text-xs bg-[#0f1720] rounded">{s.name}</div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {projects.length === 0 && <div className="text-gray-400">Belum ada project.</div>}
      </div>
    </div>
  )
}
