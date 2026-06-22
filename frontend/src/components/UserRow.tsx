import { List, Avatar, Space, Tooltip, Typography, Flex, theme } from 'antd'
import { MailOutlined, PhoneOutlined, HistoryOutlined } from '@ant-design/icons'
import { AppUser } from '../types'
import { countryFlag } from '../utils/countryFlag'
import { nameChanged } from '../utils/nameHistory'
import GenderIcon from './GenderIcon'

export default function UserRow({ user, onClick }: Props) {
  const changed = nameChanged(user)
  const { token } = theme.useToken()

  return (
    <List.Item
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '12px 16px', transition: `background-color ${token.motionDurationMid}` }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = token.colorFillAlter)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
      onMouseDown={e => (e.currentTarget.style.backgroundColor = token.colorFillSecondary)}
      onMouseUp={e => (e.currentTarget.style.backgroundColor = token.colorFillAlter)}
    >
      <List.Item.Meta
        avatar={<Avatar size={48} src={user.pictureThumbnail} />}
        title={
          <Flex vertical gap={2}>
            <Space size={8}>
              <GenderIcon gender={user.gender} />
              <Typography.Text strong>{user.title} {user.firstName} {user.lastName}</Typography.Text>
            </Space>
            {changed && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                <HistoryOutlined style={{ marginRight: 4 }} />
                was {user.originalFirstName} {user.originalLastName}
              </Typography.Text>
            )}
          </Flex>
        }
        description={
          <Space wrap size={[8, 4]}>
            <Tooltip title={user.country}>
              <Typography.Text style={{ fontSize: 20, lineHeight: 1, cursor: 'default' }}>
                {countryFlag(user.country)}
              </Typography.Text>
            </Tooltip>
            <Typography.Text type="secondary">
              <PhoneOutlined style={{ marginRight: 4 }} />{user.phone}
            </Typography.Text>
            <Typography.Text type="secondary">
              <MailOutlined style={{ marginRight: 4 }} />{user.email}
            </Typography.Text>
          </Space>
        }
      />
    </List.Item>
  )
}
