import { useState, useEffect } from 'react'

const KEY = 'vc_portfolio_v1'
const INITIAL = {
  profile: { name: 'Nama Kamu', title: 'Frontend Engineer', bio: 'Halo, saya ...', photo: null },
  skills: ['React','Tailwind CSS','Node.js'],
  projects: []
}

export default function useLocalData(){
  const [data,setData] = useState(()=>{
    try{ const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : INITIAL }catch(e){ return INITIAL }
  })
  useEffect(()=>{ localStorage.setItem(KEY, JSON.stringify(data)) }, [data])
  return [data, setData]
}
