import { useState, useEffect } from 'react';
import { profileAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Mail, Target, Briefcase, MapPin, Phone, Lock,
  Save, ShieldAlert, CheckCircle2, Trash2, Key
} from 'lucide-react';

const ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps / Cloud Engineer',
  'Cybersecurity Analyst',
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  // Profile fields
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete account
  const [deletePass, setDeletePass] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.target_role || ROLES[0]);
      setExperienceLevel(user.experience_level || 'fresher');
      setLocation(user.location || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await profileAPI.update({
        name: name.trim(),
        target_role: targetRole.trim(),
        experience_level: experienceLevel,
        location: location.trim(),
        phone: phone.trim(),
      });
      updateUser(res.data.profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePass) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }
    if (!window.confirm('WARNING: This will permanently delete your account, uploaded resumes, and interview records. Proceed?')) {
      return;
    }

    try {
      setDeleting(true);
      await authAPI.deleteAccount({ password: deletePass });
      toast.success('Account deleted. Goodbye!');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-brand">Candidate Profile</span>
          <span className="text-xs text-muted">Personal Preferences & Security</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Account & Preferences
        </h1>
        <p className="text-muted text-sm mt-1">
          Update your target dream role to tailor questions, roadmaps, and resume ATS benchmarks.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="user-avatar" style={{ width: 60, height: 60, fontSize: '1.25rem' }}>
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">{user?.name}</h2>
              <p className="text-xs text-muted">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-brand text-[10px] capitalize">
                  {user?.experience_level || 'Fresher'}
                </span>
                <span className="text-xs text-muted">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="prof-name">Full Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" size={16} />
                  <input
                    id="prof-name"
                    type="text"
                    className="form-control with-icon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="prof-email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={16} />
                  <input
                    id="prof-email"
                    type="email"
                    className="form-control with-icon"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <span className="text-[10px] text-muted block mt-1">Email cannot be changed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="prof-role">Target Dream Role</label>
                <div className="input-icon-wrapper">
                  <Target className="input-icon" size={16} />
                  <select
                    id="prof-role"
                    className="form-control with-icon"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="prof-exp">Experience Level</label>
                <div className="input-icon-wrapper">
                  <Briefcase className="input-icon" size={16} />
                  <select
                    id="prof-exp"
                    className="form-control with-icon"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="fresher">Fresher (0 yrs)</option>
                    <option value="junior">Junior (1-2 yrs)</option>
                    <option value="mid">Mid-level (3-5 yrs)</option>
                    <option value="senior">Senior (5+ yrs)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="prof-loc">Location (City / Country)</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" size={16} />
                  <input
                    id="prof-loc"
                    type="text"
                    className="form-control with-icon"
                    placeholder="e.g. Bengaluru, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="prof-phone">Phone Number (Optional)</label>
                <div className="input-icon-wrapper">
                  <Phone className="input-icon" size={16} />
                  <input
                    id="prof-phone"
                    type="tel"
                    className="form-control with-icon"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <span className="spinner spinner-sm mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card p-6">
          <h2 className="font-bold text-base mb-1 flex items-center gap-2 text-primary">
            <Key size={18} className="text-brand-400" />
            <span>Change Password</span>
          </h2>
          <p className="text-xs text-muted mb-4">
            Ensure your account is protected with a secure password at least 8 characters long.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="form-label" htmlFor="curr-pass">Current Password</label>
              <input
                id="curr-pass"
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="new-pass">New Password</label>
              <input
                id="new-pass"
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="conf-pass">Confirm New Password</label>
              <input
                id="conf-pass"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline"
              disabled={savingPassword}
            >
              {savingPassword ? (
                <>
                  <span className="spinner spinner-sm mr-2" />
                  Updating...
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="card p-6 border-l-4 border-l-rose-500 bg-rose-500/5">
          <h2 className="font-bold text-base text-rose-400 mb-1 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-muted mb-4">
            Permanently delete your account, uploaded resumes, ATS scores, and interview histories. This action is irreversible.
          </p>

          <form onSubmit={handleDeleteAccount} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="password"
              className="form-control text-xs"
              placeholder="Confirm your password to delete"
              value={deletePass}
              onChange={(e) => setDeletePass(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary bg-rose-600 hover:bg-rose-700 text-white flex-shrink-0"
              disabled={deleting}
            >
              <Trash2 size={15} className="mr-1.5" />
              <span>{deleting ? 'Deleting...' : 'Delete Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
