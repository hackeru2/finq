import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, List, Space, Alert, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import UserRow from '../components/UserRow'
import SkeletonList from '../components/SkeletonList'
import FilterBar, { FilterState, DEFAULT_FILTER } from '../components/FilterBar'
import { useDebounce } from '../hooks/useDebounce'

export default function SavedProfiles() {
  const navigate = useNavigate()
  const { savedUsers, loadingSaved, errorSaved, fetchSaved } = useStore()
  const [rawFilter, setRawFilter] = useState<FilterState>(DEFAULT_FILTER)
  const filter = useDebounce(rawFilter, 200)

  useEffect(() => {
    fetchSaved()
  }, [])

  const countries = [...new Set(savedUsers.map((u) => u.country))].sort()

  const filtered = savedUsers.filter((u) => {
    const q = filter.text.toLowerCase()
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) &&
      (filter.gender === 'all' || u.gender === filter.gender) &&
      u.age >= filter.ageRange[0] && u.age <= filter.ageRange[1] &&
      (filter.country.length === 0 || filter.country.includes(u.country))
    )
  })

  return (
    <Flex vertical style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Back</Button>
        <Typography.Title level={3} style={{ margin: 0 }}>Saved Profiles</Typography.Title>
      </Space>

      <FilterBar value={rawFilter} onChange={setRawFilter} countries={countries} />

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
    </Flex>
  )
}
