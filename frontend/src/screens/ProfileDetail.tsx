import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Button, Space, Image, Descriptions, Input, Alert, ConfigProvider, Typography,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { AppUser, UserSource } from '../types'

interface LocationState {
  user: AppUser
  source: UserSource
}

export default function ProfileDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const { saveUser, deleteUser, updateRandom, updateSaved } = useStore()

  const [firstName, setFirstName] = useState(state?.user.firstName ?? '')
  const [lastName, setLastName]   = useState(state?.user.lastName ?? '')
  const [busy, setBusy]           = useState(false)
  const [feedback, setFeedback]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  if (!state) {
    navigate('/', { replace: true })
    return null
  }

  const { user, source } = state
  const birthYear = new Date(user.dob).getFullYear()

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true)
    setFeedback(null)
    try {
      await fn()
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message ?? 'Something went wrong' })
    } finally {
      setBusy(false)
    }
  }

  const handleSave = () =>
    withBusy(async () => {
      await saveUser({ ...user, firstName, lastName })
      setFeedback({ type: 'success', msg: 'Saved!' })
    })

  const handleDelete = () =>
    withBusy(async () => {
      await deleteUser(user.id)
      navigate('/history', { replace: true })
    })

  const handleUpdate = () =>
    withBusy(async () => {
      if (source === 'saved') {
        await updateSaved(user.id, firstName, lastName)
      } else {
        updateRandom(user.id, firstName, lastName)
      }
      setFeedback({ type: 'success', msg: 'Updated!' })
    })

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px' }}>
      {/* Back + actions — always LTR */}
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
        <Space>
          {source === 'random' && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={busy}>
              Save
            </Button>
          )}
          {source === 'saved' && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          )}
          <Button icon={<EditOutlined />} onClick={handleUpdate} loading={busy}>
            Update
          </Button>
        </Space>
      </Space>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.msg}
          closable
          onClose={() => setFeedback(null)}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Hero image */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <Image
          src={user.pictureLarge}
          width={160}
          height={160}
          style={{ borderRadius: '50%', objectFit: 'cover', border: '4px solid #f0f0f0' }}
          preview={false}
        />
        <Typography.Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>
          {user.title} {firstName} {lastName}
        </Typography.Title>
      </div>

      {/*
        RTL layout: ConfigProvider flips Descriptions so labels sit on the right.
        Individual values that must stay LTR carry dir="ltr" or unicode-bidi overrides.
        Editable inputs are always dir="ltr" so Hebrew/Latin mixing in the text field
        does not confuse the cursor.
      */}
      <ConfigProvider direction="rtl">
        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: 600, width: 130 }}
          contentStyle={{ direction: 'ltr', textAlign: 'left' }}
        >
          <Descriptions.Item label="מגדר">
            <span dir="ltr">{user.gender}</span>
          </Descriptions.Item>

          <Descriptions.Item label="שם">
            {/* Inputs remain LTR: cursor behaves correctly for Latin names */}
            <Space dir="ltr">
              <Input
                dir="ltr"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                style={{ width: 130 }}
              />
              <Input
                dir="ltr"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                style={{ width: 130 }}
              />
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="גיל ושנת לידה">
            <span dir="ltr">{user.age} ({birthYear})</span>
          </Descriptions.Item>

          <Descriptions.Item label="כתובת">
            <span dir="ltr">
              {user.streetNumber} {user.streetName}, {user.city}, {user.state}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="אימייל">
            <span dir="ltr">{user.email}</span>
          </Descriptions.Item>

          <Descriptions.Item label="טלפון">
            <span dir="ltr">{user.phone}</span>
          </Descriptions.Item>
        </Descriptions>
      </ConfigProvider>
    </div>
  )
}
