import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Typography } from 'antd'
import Home from './screens/Home'
import RandomList from './screens/RandomList'
import SavedProfiles from './screens/SavedProfiles'
import ProfileDetail from './screens/ProfileDetail'

declare const __GIT_SHA__: string

export default function App() {
  return (
    <BrowserRouter>
      <Typography.Text
        type="secondary"
        style={{
          position: 'fixed',
          bottom: 8,
          right: 12,
          fontSize: 11,
          opacity: 0.5,
          zIndex: 9999,
          pointerEvents: 'none',
          fontFamily: 'monospace',
        }}
      >
        {__GIT_SHA__}
      </Typography.Text>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/random"  element={<RandomList />} />
        <Route path="/history" element={<SavedProfiles />} />
        <Route path="/profile" element={<ProfileDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
