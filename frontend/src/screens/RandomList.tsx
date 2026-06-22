import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, List, Space, Alert, Typography } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import UserRow from '../components/UserRow'
import SkeletonList from '../components/SkeletonList'
import FilterBar, { FilterState } from '../components/FilterBar'
import { useDebounce } from '../hooks/useDebounce'

const DEFAULT_FILTER: FilterState = { text: '', gender: 'all', ageRange: [0, 100] }

export default function RandomList() {
  const navigate = useNavigate()
  const { randomUsers, loadingRandom, errorRandom, fetchRandom } = useStore()
  const [rawFilter, setRawFilter] = useState<FilterState>(DEFAULT_FILTER)
  const filter = useDebounce(rawFilter, 200)

  useEffect(() => {
    if (randomUsers.length === 0) fetchRandom()
  }, [])

  const filtered = randomUsers.filter((u) => {
    const q = filter.text.toLowerCase()
    return (
      (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.country.toLowerCase().includes(q)) &&
      (filter.gender === 'all' || u.gender === filter.gender) &&
      u.age >= filter.ageRange[0] && u.age <= filter.ageRange[1]
    )
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Back</Button>
          <Typography.Title level={3} style={{ margin: 0 }}>Random Users</Typography.Title>
        </Space>
        <Button icon={<ReloadOutlined />} onClick={fetchRandom} loading={loadingRandom}>
          Refresh
        </Button>
      </Space>

      <FilterBar value={rawFilter} onChange={setRawFilter} />

      {errorRandom && <Alert type="error" message={errorRandom} style={{ marginBottom: 16 }} />}

      {loadingRandom ? (
        <SkeletonList count={10} />
      ) : (
        <List
          bordered
          dataSource={filtered}
          locale={{ emptyText: rawFilter.text || rawFilter.gender !== 'all' ? 'No users match the filter' : 'No users loaded' }}
          renderItem={(user) => (
            <UserRow
              key={user.id}
              user={user}
              onClick={() => navigate('/profile', { state: { user, source: 'random' } })}
            />
          )}
        />
      )}
    </div>
  )
}
