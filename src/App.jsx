import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Apps from './pages/Apps'
import Experience from './pages/Experience'
import Resume from './pages/Resume'
import AppFrame from './components/AppFrame'

// Reads :slug from the URL and passes it to AppFrame
function AppFramePage() {
  const { slug } = useParams()
  return <AppFrame appId={slug} />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apps" element={<Apps />} />
            {/* /apps/gallery-wall → full-viewport iframe of the app */}
            <Route path="/apps/:slug" element={<AppFramePage />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/resume" element={<Resume />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
