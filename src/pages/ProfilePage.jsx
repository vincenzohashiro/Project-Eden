import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

function ProfilePage() {
  const { user, profile, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  if (loading || !user) {
    return (
      <div className="profile-page profile-loading">
        <span className="eyebrow">LOADING SESSION</span>
      </div>
    )
  }

  const displayName = profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Colonist'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <span className="hero-corner tl" aria-hidden="true" />
        <span className="hero-corner br" aria-hidden="true" />

        <div className="profile-header">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="profile-identity">
            <h1>{displayName}</h1>
            {profile?.discord_username && (
              <span className="profile-discord-tag">{profile.discord_username.replace(/#\d+$/, '')}</span>
            )}
          </div>
          <button type="button" className="btn btn-ghost profile-signout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-label">Member Since</span>
            <span className="profile-stat-value">{memberSince}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-label">Discord</span>
            <span className="profile-stat-value profile-stat-linked">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
