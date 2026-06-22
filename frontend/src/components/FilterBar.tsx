import { useState } from 'react'
import { Button, Modal, Radio, Slider, Select, Badge, Space, Typography, Flex, Input } from 'antd'
import { FilterOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons'

export interface FilterState {
  text: string
  gender: 'all' | 'male' | 'female'
  ageRange: [number, number]
  country: string
}

export const DEFAULT_FILTER: FilterState = {
  text: '',
  gender: 'all',
  ageRange: [0, 100],
  country: '',
}

/** True when any modal filter (gender / age / country) differs from its default. */
export function isFilterActive(f: FilterState): boolean {
  return (
    f.gender !== 'all' ||
    f.ageRange[0] !== 0 ||
    f.ageRange[1] !== 100 ||
    f.country !== ''
  )
}

/** Number of active modal filters — drives the badge count on the button. */
export function activeFilterCount(f: FilterState): number {
  let n = 0
  if (f.gender !== 'all') n++
  if (f.ageRange[0] !== 0 || f.ageRange[1] !== 100) n++
  if (f.country !== '') n++
  return n
}

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
  /** Unique country names from the current user list, shown in the Country select. */
  countries: string[]
}

export default function FilterBar({ value, onChange, countries }: Props) {
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState<FilterState>(value)

  const count  = activeFilterCount(value)
  const active = count > 0

  const patch = (p: Partial<FilterState>) => setDraft((d) => ({ ...d, ...p }))

  const handleOpen   = () => { setDraft(value); setOpen(true) }
  const handleApply  = () => { onChange(draft); setOpen(false) }
  const handleCancel = () => setOpen(false)
  const handleReset  = () => { const d = { ...DEFAULT_FILTER, text: value.text }; setDraft(d); onChange(d) }

  return (
    <>
      <Flex gap={8} style={{ marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Filter by name…"
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          allowClear
          style={{ flex: 1 }}
        />

        {/* Badge shines (turns red) when modal filters are active */}
        <Badge count={count} size="small">
          <Button
            icon={<FilterOutlined />}
            type={active ? 'primary' : 'default'}
            onClick={handleOpen}
          >
            Filters
          </Button>
        </Badge>
      </Flex>

      <Modal
        title="Filters"
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button key="reset" icon={<ClearOutlined />} onClick={handleReset} disabled={!isFilterActive(draft)}>
            Reset all
          </Button>,
          <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
          <Button key="apply" type="primary" onClick={handleApply}>Apply</Button>,
        ]}
      >
        <Flex vertical gap={28} style={{ padding: '12px 0' }}>
          <Flex vertical gap={10}>
            <Typography.Text strong>Gender</Typography.Text>
            <Radio.Group
              value={draft.gender}
              onChange={(e) => patch({ gender: e.target.value })}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="male">Male</Radio.Button>
              <Radio.Button value="female">Female</Radio.Button>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={10}>
            <Typography.Text strong>
              Age: {draft.ageRange[0]}–{draft.ageRange[1]}
            </Typography.Text>
            <Slider
              range
              min={0}
              max={100}
              value={draft.ageRange}
              onChange={(v) => patch({ ageRange: v as [number, number] })}
            />
          </Flex>

          <Flex vertical gap={10}>
            <Typography.Text strong>Country</Typography.Text>
            <Select
              allowClear
              showSearch
              placeholder="Any country"
              value={draft.country || undefined}
              onChange={(v) => patch({ country: v ?? '' })}
              options={[...countries].sort().map((c) => ({ label: c, value: c }))}
              style={{ width: '100%' }}
            />
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}
