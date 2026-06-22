import { List, Avatar, Space, Tag } from 'antd'
import { ManOutlined, WomanOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { AppUser } from '../types'

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
            <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
          </Space>
        }
        description={
          <Space wrap size={[8, 4]}>
            <Tag>{user.country}</Tag>
            <span><PhoneOutlined style={{ marginRight: 4 }} />{user.phone}</span>
            <span><MailOutlined style={{ marginRight: 4 }} />{user.email}</span>
          </Space>
        }
      />
    </List.Item>
  )
}
