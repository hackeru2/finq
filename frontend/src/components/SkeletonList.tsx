import { List, Skeleton } from 'antd'

interface Props {
  count: number
}

export default function SkeletonList({ count }: Props) {
  return (
    <List
      bordered
      itemLayout="horizontal"
      dataSource={Array.from({ length: count }, (_, i) => i)}
      renderItem={(i) => (
        <List.Item key={i} style={{ padding: '12px 16px' }}>
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        </List.Item>
      )}
    />
  )
}
