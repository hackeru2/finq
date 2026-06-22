import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function FilterInput({ value, onChange }: Props) {
  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder="Filter by name or country…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      allowClear
      style={{ marginBottom: 16 }}
    />
  )
}
