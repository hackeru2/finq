import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Space, Image, Input, Alert, Typography } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { AppUser, UserSource } from '../types'
import { validateName, validateNamePair, getInputDir } from '../utils/nameValidation'

interface LocationState {
  user: AppUser
  source: UserSource
}

/** Single row in the RTL profile card. Label sits on the right (natural in dir=rtl). */
function Field({
  label,
  children,
  last = false,
}: {
  label: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 20px',
        borderBottom: last ? 'none' : '1px solid #f0f0f0',
      }}
    >
      <div style={{ minWidth: 140, fontWeight: 600, fontSize: 14, flexShrink: 0, paddingTop: 2 }}>
        {label}
      </div>
      {/* dir=ltr ensures every data value reads left-to-right inside the RTL card */}
      <div dir="ltr" style={{ flex: 1, fontSize: 14, color: '#595959', textAlign: 'left' }}>
        {children}
      </div>
    </div>
  )
}

export default function ProfileDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const { saveUser, deleteUser, updateRandom, updateSaved } = useStore()

  const [firstName, setFirstName] = useState(state?.user.firstName ?? '')
  const [lastName, setLastName] = useState(state?.user.lastName ?? '')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  if (!state) {
    navigate('/', { replace: true })
    return null
  }

  const { user, source } = state
  const birthYear = new Date(user.dob).getFullYear()

  const firstNameError = validateName(firstName)
  const lastNameError  = validateName(lastName)
  const pairError      = validateNamePair(firstName, lastName)
  const hasErrors      = Boolean(firstNameError || lastNameError || pairError)

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
      {/* Action bar — always LTR */}
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Space>
          {source === 'random' && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={busy}
              disabled={hasErrors}
            >
              Save
            </Button>
          )}
          {source === 'saved' && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={handleUpdate}
            loading={busy}
            disabled={hasErrors}
          >
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
          {firstName} {lastName}
        </Typography.Title>
      </div>

      {/*
        RTL card: dir="rtl" reverses flex order so label (first child) lands on the right.
        Each Field's value cell carries dir="ltr" to keep data reading left-to-right.
        Name inputs get dir set dynamically: if user types Hebrew → rtl cursor, Latin → ltr.
        Validation rules: no numbers, no mixing Hebrew and Latin in the same field.
      */}
      <div
        dir="rtl"
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <Field label="מגדר">{user.gender}</Field>

        {/* Name field: custom layout to host per-input validation messages */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 20px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{ minWidth: 140, fontWeight: 600, fontSize: 14, flexShrink: 0, paddingTop: 2 }}
          >
            שם
          </div>
          <div dir="ltr" style={{ flex: 1, textAlign: 'left' }}>
            <Space direction="vertical" size={4}>
              <Space align="start">
                <div>
                  <Input
                    dir={getInputDir(firstName)}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={{ width: 150 }}
                    status={firstNameError || pairError ? 'error' : undefined}
                  />
                  {firstNameError && (
                    <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>
                      {firstNameError}
                    </div>
                  )}
                </div>
                <div>
                  <Input
                    dir={getInputDir(lastName)}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={{ width: 150 }}
                    status={lastNameError || pairError ? 'error' : undefined}
                  />
                  {lastNameError && (
                    <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 2 }}>
                      {lastNameError}
                    </div>
                  )}
                </div>
              </Space>
              {pairError && (
                <div style={{ color: '#ff4d4f', fontSize: 12 }}>{pairError}</div>
              )}
            </Space>
          </div>
        </div>

        <Field label="גיל ושנת לידה">
          {user.age} ({birthYear})
        </Field>
        <Field label="כתובת">
          {user.streetNumber} {user.streetName}, {user.city}, {user.state}
        </Field>
        <Field label="אימייל">{user.email}</Field>
        <Field label="טלפון" last>{user.phone}</Field>
      </div>
    </div>
  )
}
