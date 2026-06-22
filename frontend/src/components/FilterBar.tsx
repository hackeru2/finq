import { Input, Radio, Slider, Space, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export interface FilterState {
  text: string
  gender: 'all' | 'male' | 'female'
  ageRange: [number, number]
}

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
}

export default function FilterBar({ value, onChange }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })

  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size={10}>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Filter by name or country…"
        value={value.text}
        onChange={(e) => set({ text: e.target.value })}
        allowClear
      />

      <Space wrap>
        <Radio.Group
          value={value.gender}
          onChange={(e) => set({ gender: e.target.value })}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="male">Male</Radio.Button>
          <Radio.Button value="female">Female</Radio.Button>
        </Radio.Group>

        <Space size={8}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Age {value.ageRange[0]}–{value.ageRange[1]}
          </Typography.Text>
          <Slider
            range
            min={0}
            max={100}
            value={value.ageRange}
            onChange={(v) => set({ ageRange: v as [number, number] })}
            style={{ width: 160 }}
          />
        </Space>
      </Space>
    </Space>
  )
}
