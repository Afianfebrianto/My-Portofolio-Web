import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import About from './pages/About'
import Porto from './pages/Porto'
import PortoDetail from './pages/PortoDetail'
import AdminShell from './admin/AdminShell'

export default function App(){
  return (
    <div>
      <Nav />
      <main className="container py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/porto" element={<Porto/>} />
          <Route path="/porto/:id" element={<PortoDetail/>} />
          <Route path="/admin/*" element={<AdminShell/>} />
        </Routes>
      </main>
    </div>
  )
}
