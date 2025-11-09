// src/utils/useFirestore.js
import { useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, getDoc
} from 'firebase/firestore'
import { db } from '../firebase'

// profile realtime
export function useProfileRealtime(){
  const [profile, setProfile] = useState(null)
  useEffect(()=>{
    const ref = doc(db, 'meta', 'profile')
    const unsub = onSnapshot(ref, snap => {
      if(snap.exists()) setProfile(snap.data())
      else setProfile(null)
    })
    return unsub
  },[])
  const saveProfile = (data) => updateDoc(doc(db,'meta','profile'), data).catch(async (err)=>{
    // if doc doesn't exist, set via add/setDoc fallback
    try{ await addDoc(collection(db,'meta'), { profile: data }) }catch(e){ console.error(e) }
  })
  // better: use setDoc merge; but keep simple: use updateDoc and ignore if not exists
  return [profile, (data) => import('../firebase').then(({ db }) => {
    // safer: use setDoc to create/merge
    const { setDoc } = require('firebase/firestore')
    return setDoc(doc(db,'meta','profile'), data, { merge: true })
  }).then(()=>{}).catch(()=>saveProfile(data))]
}

// Skills realtime (each doc: { name, image, createdAt })
export function useSkillsRealtime(){
  const [skills, setSkills] = useState([])
  useEffect(()=>{
    const q = query(collection(db,'skills'), orderBy('createdAt','asc'))
    const unsub = onSnapshot(q, snap => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  },[])
  const addSkill = (payload)=> addDoc(collection(db,'skills'), { ...payload, createdAt: Date.now() })
  const removeSkill = (id)=> deleteDoc(doc(db,'skills', id))
  return [skills, addSkill, removeSkill]
}

// Projects realtime (doc fields: title, short, desc, link, images:[url,...], createdAt)
export function useProjectsRealtime(){
  const [projects, setProjects] = useState([])
  useEffect(()=>{
    const q = query(collection(db,'projects'), orderBy('createdAt','asc'))
    const unsub = onSnapshot(q, snap => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return unsub
  },[])
  const addProject = async (payload)=> {
    // payload must include images: array (can be empty)
    return addDoc(collection(db,'projects'), { ...payload, createdAt: Date.now() })
  }
  const updateProject = async (id, patch) => updateDoc(doc(db,'projects', id), patch)
  const removeProject = async (id) => deleteDoc(doc(db,'projects', id))
  return [projects, addProject, updateProject, removeProject]
}

// helper to get one project
export async function getProjectById(id){
  const d = await getDoc(doc(db, 'projects', id))
  return d.exists() ? { id: d.id, ...d.data() } : null
}
