import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Apps from './pages/Apps'
import Experience from './pages/Experience'
import Resume from './pages/Resume'

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/resume" element={<Resume />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}
