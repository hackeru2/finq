import { List, Avatar, Space, Tag } from 'antd'
import { MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { AppUser } from '../types'

interface Props {
  user: AppUser
  onClick: () => void
}

export default function UserRow({ user, onClick }: Props) {
  return (
    <List.Item
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '12px 16px' }}
      className="user-row"
    >
      <List.Item.Meta
        avatar={<Avatar size={48} src={user.pictureThumbnail} />}
        title={<span style={{ fontWeight: 600 }}>{user.title} {user.firstName} {user.lastName}</span>}
        description={
          <Space wrap size={[8, 4]}>
            <Tag color="blue">{user.gender}</Tag>
            <Tag>{user.country}</Tag>
            <span><PhoneOutlined style={{ marginRight: 4 }} />{user.phone}</span>
            <span><MailOutlined style={{ marginRight: 4 }} />{user.email}</span>
          </Space>
        }
      />
    </List.Item>
  )
}
