import { useEffect } from 'react';
import { useApp } from '../App';
import { avatarBackendEnabled, avatarOwnerKey, fetchStudentAvatar } from '../utils/avatarApi';

// A single session reader, never a request per ranking row or per avatar image.
export default function AvatarSessionSync({ client, enabled = avatarBackendEnabled }) {
  const { student, setStudent } = useApp();
  const owner = avatarOwnerKey(student);
  useEffect(() => {
    if (!enabled || !student?.authVerified || student.isDemo || student.role !== 'student') return;
    let active = true;
    fetchStudentAvatar(student, client, { enabled }).then(result => {
      if (active) setStudent(current => avatarOwnerKey(current) === owner && current.avatar === student.avatar
        ? { ...current, avatar: result.avatar, avatarReceipt: owner } : current);
    }).catch(() => { /* Saving remains explicit and reports its own error in Studio. */ });
    return () => { active = false; };
  }, [owner, student?.authVerified, setStudent, client, enabled]);
  return null;
}
