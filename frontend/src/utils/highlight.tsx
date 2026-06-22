import { Typography } from 'antd'

export function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <Typography.Text mark>{text.slice(idx, idx + query.length)}</Typography.Text>
      {text.slice(idx + query.length)}
    </>
  )
}
