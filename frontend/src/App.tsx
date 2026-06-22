import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import RandomList from './screens/RandomList'
import SavedProfiles from './screens/SavedProfiles'
import ProfileDetail from './screens/ProfileDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/random"  element={<RandomList />} />
        <Route path="/history" element={<SavedProfiles />} />
        <Route path="/profile" element={<ProfileDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
