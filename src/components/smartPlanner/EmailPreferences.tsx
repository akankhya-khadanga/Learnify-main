import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface EmailPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

interface NotificationPreferences {
  email_notifications_enabled: boolean
  notification_email: string | null
  notify_7_days_before: boolean
  notify_3_days_before: boolean
  notify_1_day_before: boolean
  notify_on_exam_day: boolean
  preferred_notification_time: string
  timezone: string
}

export function EmailPreferences({ isOpen, onClose }: EmailPreferencesProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications_enabled: true,
    notification_email: null,
    notify_7_days_before: true,
    notify_3_days_before: true,
    notify_1_day_before: true,
    notify_on_exam_day: true,
    preferred_notification_time: '12:00',
    timezone: 'Asia/Kolkata'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      setUserEmail(user.email || null)

      setLoading(true)
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled,
          notification_email: data.notification_email,
          notify_7_days_before: data.notify_7_days_before,
          notify_3_days_before: data.notify_3_days_before,
          notify_1_day_before: data.notify_1_day_before,
          notify_on_exam_day: data.notify_on_exam_day,
          preferred_notification_time: data.preferred_notification_time || '12:00',
          timezone: data.timezone || 'Asia/Kolkata'
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      setMessage({ type: 'error', text: 'Failed to load preferences' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadPreferences()
    }
  }, [isOpen, loadPreferences])

  const savePreferences = async () => {
    if (!userId) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage({ type: 'error', text: 'Failed to save preferences' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#FFF8E1] border-4 border-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neon border-b-4 border-black p-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-black">📧 Email Notification Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-black font-bold">Loading preferences...</p>
            </div>
          ) : (
            <>
              {/* Master Toggle */}
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg text-black mb-1">Enable Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive exam reminders via email</p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, email_notifications_enabled: !prev.email_notifications_enabled }))}
                    className={`relative w-16 h-8 rounded-full border-4 border-black transition-colors ${preferences.email_notifications_enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                  >
                    <motion.div
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-black rounded-full"
                      animate={{ x: preferences.email_notifications_enabled ? 28 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <label className="block font-black text-black mb-2">Notification Email Address</label>
                <p className="text-sm text-gray-600 mb-3">Leave blank to use your account email</p>
                <input
                  type="email"
                  value={preferences.notification_email || ''}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notification_email: e.target.value || null }))}
                  placeholder={userEmail || 'your@email.com'}
                  disabled={!preferences.email_notifications_enabled}
                  className="w-full px-4 py-3 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-neon disabled:bg-gray-100 disabled:cursor-not-allowed font-bold"
                />
              </div>

              {/* Timing Options */}
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <h3 className="font-black text-lg text-black mb-4">⏰ When to Notify Me</h3>
                <div className="space-y-3">
                  {[
                    { key: 'notify_7_days_before', label: '7 Days Before Exam', icon: '📚' },
                    { key: 'notify_3_days_before', label: '3 Days Before Exam', icon: '⚠️' },
                    { key: 'notify_1_day_before', label: '1 Day Before Exam', icon: '🚨' },
                    { key: 'notify_on_exam_day', label: 'On Exam Day (2 hours before)', icon: '🎯' }
                  ].map(({ key, label, icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-4 border-4 border-black rounded-lg cursor-pointer transition-colors ${preferences[key as keyof NotificationPreferences]
                          ? 'bg-neon/20 hover:bg-neon/30'
                          : 'bg-gray-50 hover:bg-gray-100'
                        } ${!preferences.email_notifications_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={preferences[key as keyof NotificationPreferences] as boolean}
                        onChange={(e) => setPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                        disabled={!preferences.email_notifications_enabled}
                        className="w-6 h-6 border-4 border-black rounded accent-neon"
                      />
                      <span className="font-bold text-black flex-1">
                        {icon} {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Time */}
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <label className="block font-black text-black mb-2">🕐 Preferred Notification Time</label>
                <p className="text-sm text-gray-600 mb-3">What time should we send reminders?</p>
                <input
                  type="time"
                  value={preferences.preferred_notification_time}
                  onChange={(e) => setPreferences(prev => ({ ...prev, preferred_notification_time: e.target.value }))}
                  disabled={!preferences.email_notifications_enabled}
                  className="w-full px-4 py-3 border-4 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-neon disabled:bg-gray-100 disabled:cursor-not-allowed font-bold text-lg"
                />
              </div>

              {/* Timezone */}
              <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <label className="block font-black text-black mb-2">🌍 Timezone</label>
                <input
                  type="text"
                  value="Asia/Kolkata (IST - Indian Standard Time)"
                  disabled
                  className="w-full px-4 py-3 border-4 border-black rounded-lg bg-gray-100 font-bold text-gray-700"
                />
                <p className="text-sm text-gray-600 mt-2">Tamil Nadu, India (UTC+5:30)</p>
              </div>

              {/* Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-4 border-black rounded-lg font-bold ${message.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {message.text}
                </motion.div>
              )}

              {/* Save Button */}
              <button
                onClick={savePreferences}
                disabled={saving}
                className="w-full py-4 bg-neon border-4 border-black rounded-lg font-black text-lg text-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : '💾 Save Preferences'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
