import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, List, Space, Alert, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import UserRow from '../components/UserRow'
import SkeletonList from '../components/SkeletonList'
import FilterBar, { FilterState } from '../components/FilterBar'
import { useDebounce } from '../hooks/useDebounce'

const DEFAULT_FILTER: FilterState = { text: '', gender: 'all', ageRange: [0, 100] }

export default function SavedProfiles() {
  const navigate = useNavigate()
  const { savedUsers, loadingSaved, errorSaved, fetchSaved } = useStore()
  const [rawFilter, setRawFilter] = useState<FilterState>(DEFAULT_FILTER)
  const filter = useDebounce(rawFilter, 200)

  useEffect(() => {
    fetchSaved()
  }, [])

  const filtered = savedUsers.filter((u) => {
    const q = filter.text.toLowerCase()
    return (
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)) &&
      (filter.gender === 'all' || u.gender === filter.gender) &&
      u.age >= filter.ageRange[0] && u.age <= filter.ageRange[1]
    )
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Back</Button>
        <Typography.Title level={3} style={{ margin: 0 }}>Saved Profiles</Typography.Title>
      </Space>

      <FilterBar value={rawFilter} onChange={setRawFilter} />

      {errorSaved && <Alert type="error" message={errorSaved} style={{ marginBottom: 16 }} />}

      {loadingSaved ? (
        <SkeletonList count={5} />
      ) : (
        <List
          bordered
          dataSource={filtered}
          locale={{ emptyText: savedUsers.length === 0 ? 'No saved profiles yet.' : 'No profiles match the filter' }}
          renderItem={(user) => (
            <UserRow
              key={user.id}
              user={user}
              onClick={() => navigate('/profile', { state: { user, source: 'saved' } })}
            />
          )}
        />
      )}
    </div>
  )
}
