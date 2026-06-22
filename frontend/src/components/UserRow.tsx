import { List, Avatar, Space, Tooltip, Typography } from 'antd'
import { ManOutlined, WomanOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { AppUser } from '../types'
import { countryFlag } from '../utils/countryFlag'

interface Props {
  user: AppUser
  onClick: () => void
}

const GenderIcon = ({ gender }: { gender: string }) =>
  gender === 'male'
    ? <ManOutlined aria-label="male" style={{ color: '#1677ff', fontSize: 16 }} />
    : <WomanOutlined aria-label="female" style={{ color: '#eb2f96', fontSize: 16 }} />

export default function UserRow({ user, onClick }: Props) {
  return (
    <List.Item
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '12px 16px' }}
      className="user-row"
    >
      <List.Item.Meta
        avatar={<Avatar size={48} src={user.pictureThumbnail} />}
        title={
          <Space size={8}>
            <GenderIcon gender={user.gender} />
            <Typography.Text strong>{user.firstName} {user.lastName}</Typography.Text>
          </Space>
        }
        description={
          <Space wrap size={[8, 4]}>
            <Tooltip title={user.country}>
              <span style={{ fontSize: 20, lineHeight: 1, cursor: 'default' }}>
                {countryFlag(user.country)}
              </span>
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
