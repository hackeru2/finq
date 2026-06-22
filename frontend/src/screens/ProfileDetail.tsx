import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Space, Image, Input, Alert, Typography, Flex, Tooltip } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { AppUser, UserSource } from '../types'
import { validateName, validateNamePair, getInputDir } from '../utils/nameValidation'
import { countryFlag } from '../utils/countryFlag'

interface LocationState {
  user: AppUser
  source: UserSource
}

const FIELD_BORDER = '1px solid #f0f0f0'

/** One row in the RTL profile card. dir=rtl on the card reverses flex so the label lands on the right. */
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
    <Flex
      align="flex-start"
      gap={12}
      style={{ padding: '14px 20px', borderBottom: last ? 'none' : FIELD_BORDER }}
    >
      <Typography.Text
        strong
        style={{ minWidth: 140, flexShrink: 0, fontSize: 14, paddingTop: 2 }}
      >
        {label}
      </Typography.Text>
      {/* dir=ltr keeps every data value reading left-to-right inside the RTL card */}
      <div dir="ltr" style={{ flex: 1, minWidth: 0, fontSize: 14, color: '#595959' }}>
        {children}
      </div>
    </Flex>
  )
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

  const handleSave   = () => withBusy(async () => {
    await saveUser({ ...user, firstName, lastName })
    // Keep the random list in sync so pressing Back shows the edited names
    updateRandom(user.id, firstName, lastName)
    setFeedback({ type: 'success', msg: 'Saved!' })
  })
  const handleDelete = () => withBusy(async () => { await deleteUser(user.id); navigate('/history', { replace: true }) })
  const handleUpdate = () => withBusy(async () => {
    if (source === 'saved') await updateSaved(user.id, firstName, lastName)
    else updateRandom(user.id, firstName, lastName)
    setFeedback({ type: 'success', msg: 'Updated!' })
  })

  return (
    <Flex vertical style={{ maxWidth: 620, margin: '0 auto', padding: '24px 16px' }}>
      {/* Action bar — always LTR */}
      <Flex justify="space-between" style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
        <Space>
          {source === 'random' && (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={busy} disabled={hasErrors}>
              Save
            </Button>
          )}
          {source === 'saved' && (
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={busy}>
              Delete
            </Button>
          )}
          <Button icon={<EditOutlined />} onClick={handleUpdate} loading={busy} disabled={hasErrors}>
            Update
          </Button>
        </Space>
      </Flex>

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
      <Flex vertical align="center" style={{ marginBottom: 28 }}>
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
      </Flex>

      {/*
        RTL card: dir="rtl" reverses flex order so the label (first child) lands on the right.
        Each Field's value cell carries dir="ltr" to keep data reading left-to-right.
        Name inputs get dir set dynamically: Hebrew text → rtl cursor, Latin → ltr.
        Validation: no numbers, no mixing scripts in one field, both fields must share a script.
      */}
      <Flex
        dir="rtl"
        vertical
        style={{
          background: '#fff',
          border: FIELD_BORDER,
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <Field label="מדינה">
          <Tooltip title={user.country}>
            <span style={{ fontSize: 24, lineHeight: 1, cursor: 'default' }}>
              {countryFlag(user.country)}
            </span>
          </Tooltip>
        </Field>
        <Field label="מגדר">{user.gender}</Field>

        {/* Name: custom row — needs per-input validation messages and dynamic direction */}
        <Flex
          align="flex-start"
          gap={12}
          style={{ padding: '14px 20px', borderBottom: FIELD_BORDER }}
        >
          <Typography.Text
            strong
            style={{ minWidth: 140, flexShrink: 0, fontSize: 14, paddingTop: 2 }}
          >
            שם
          </Typography.Text>

          {/*
            dir=ltr resets direction for the inputs.
            Outer Flex: vertical, holds the input row + pair error.
            Inner Flex: wrap — inputs stay side-by-side when space allows,
            break to separate rows on viewports narrower than ~430px.
            minWidth:120 is the wrap threshold; flex:1 + width:100% makes
            each input stretch to fill its share of available space.
          */}
          <Flex dir="ltr" vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Flex gap={8} wrap="wrap">
              <Flex vertical style={{ flex: 1, minWidth: 120 }}>
                <Input
                  dir={getInputDir(firstName)}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  style={{ width: '100%' }}
                  status={firstNameError || pairError ? 'error' : undefined}
                />
                {firstNameError && (
                  <Typography.Text type="danger" style={{ fontSize: 12 }}>
                    {firstNameError}
                  </Typography.Text>
                )}
              </Flex>
              <Flex vertical style={{ flex: 1, minWidth: 120 }}>
                <Input
                  dir={getInputDir(lastName)}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  style={{ width: '100%' }}
                  status={lastNameError || pairError ? 'error' : undefined}
                />
                {lastNameError && (
                  <Typography.Text type="danger" style={{ fontSize: 12 }}>
                    {lastNameError}
                  </Typography.Text>
                )}
              </Flex>
            </Flex>
            {pairError && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {pairError}
              </Typography.Text>
            )}
          </Flex>
        </Flex>

        <Field label="גיל ושנת לידה">{user.age} ({birthYear})</Field>
        <Field label="כתובת">{user.streetNumber} {user.streetName}, {user.city}, {user.state}</Field>
        <Field label="אימייל">
          {/* ellipsis clips long addresses; tooltip shows the full email on hover */}
          <Typography.Text ellipsis={{ tooltip: user.email }} style={{ display: 'block' }}>
            {user.email}
          </Typography.Text>
        </Field>
        <Field label="טלפון" last>{user.phone}</Field>
      </Flex>
    </Flex>
  )
}
