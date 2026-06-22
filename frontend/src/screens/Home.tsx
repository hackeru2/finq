import { Button, Flex, Space, Typography } from 'antd'
import { UserOutlined, HistoryOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <Flex vertical align="center" justify="center" gap={40} style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Typography.Title level={1} style={{ marginBottom: 0 }}>
        Random Profiles
      </Typography.Title>
      <Space size="large">
        <Button
          type="primary"
          size="large"
          icon={<UserOutlined />}
          onClick={() => navigate('/random')}
          style={{ padding: '0 40px', height: 48, fontSize: 16 }}
        >
          Fetch
        </Button>
        <Button
          size="large"
          icon={<HistoryOutlined />}
          onClick={() => navigate('/history')}
          style={{ padding: '0 40px', height: 48, fontSize: 16 }}
        >
          History
        </Button>
      </Space>
    </Flex>
  )
}
