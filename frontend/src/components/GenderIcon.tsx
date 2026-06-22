import { Tooltip } from 'antd'
import { ManOutlined, WomanOutlined } from '@ant-design/icons'

interface Props {
  gender: string
  size?: number
  tooltip?: boolean
}

export default function GenderIcon({ gender, size = 16, tooltip = false }: Props) {
  const icon = gender === 'male'
    ? <ManOutlined aria-label="male" style={{ color: '#1677ff', fontSize: size }} />
    : <WomanOutlined aria-label="female" style={{ color: '#eb2f96', fontSize: size }} />

  return tooltip ? <Tooltip title={gender}>{icon}</Tooltip> : icon
}
