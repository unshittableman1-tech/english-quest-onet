import React, { useState, useEffect } from 'react';
import {
  Shield, X, Check, Key, User, Mail, Building, Sparkles, AlertTriangle, CheckSquare, Square
} from 'lucide-react';
import {
  ADMIN_PERMISSIONS, ADMIN_ROLES, getDefaultPermissionsForRole, saveAdmin, deleteAdmin
} from '../utils/adminStorage';

export default function AdminManagementModal({
  isOpen,
  onClose,
  admin = null, // null for create, object for edit
  schools = [],
  onSaved,
  mode = 'edit' // 'create' | 'edit' | 'delete'
}) {
  const isCreate = mode === 'create' || !admin;
  const isDelete = mode === 'delete';

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'platform_admin',
    schoolId: '',
    schoolName: '',
    status: 'active',
    initialPassword: '',
    permissions: getDefaultPermissionsForRole('platform_admin')
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');

    if (admin && !isCreate) {
      setForm({
        id: admin.id,
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || 'school_admin',
        schoolId: admin.schoolId || '',
        schoolName: admin.schoolName || '',
        status: admin.status || 'active',
        initialPassword: '',
        permissions: {
          ...getDefaultPermissionsForRole(admin.role || 'school_admin'),
          ...(admin.permissions || {})
        }
      });
    } else {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      setForm({
        name: '',
        email: '',
        role: 'platform_admin',
        schoolId: '',
        schoolName: 'ระบบส่วนกลาง',
        status: 'active',
        initialPassword: `Admin@${randomDigits}`,
        permissions: getDefaultPermissionsForRole('platform_admin')
      });
    }
  }, [isOpen, admin, isCreate]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole) => {
    const updatedPerms = getDefaultPermissionsForRole(newRole);
    setForm(prev => ({
      ...prev,
      role: newRole,
      permissions: updatedPerms,
      schoolName: newRole === 'school_admin' ? (schools.find(s => s.id === prev.schoolId)?.name || 'โปรดเลือกโรงเรียน') : 'ระบบส่วนกลาง'
    }));
  };

  const handleSchoolChange = (newSchoolId) => {
    const matched = schools.find(s => s.id === newSchoolId || s.code === newSchoolId);
    setForm(prev => ({
      ...prev,
      schoolId: newSchoolId,
      schoolName: matched ? `${matched.name} (${matched.code})` : ''
    }));
  };

  const togglePermission = (permId) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions?.[permId]
      }
    }));
  };

  const selectAllPermissions = (value) => {
    const next = {};
    ADMIN_PERMISSIONS.forEach(p => { next[p.id] = value; });
    setForm(prev => ({ ...prev, permissions: next }));
  };

  const resetToRoleDefaults = () => {
    setForm(prev => ({
      ...prev,
      permissions: getDefaultPermissionsForRole(prev.role)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isDelete) {
      try {
        setSaving(true);
        deleteAdmin(admin.id);
        if (onSaved) onSaved({ type: 'delete', id: admin.id });
        onClose();
      } catch (err) {
        setError(err?.message || 'เกิดข้อผิดพลาดในการลบ Admin');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.name.trim()) return setError('กรุณาระบุชื่อ-นามสกุลของผู้ดูแล');
    if (!form.email.trim() || !form.email.includes('@')) return setError('กรุณาระบุอีเมลที่ถูกต้อง');
    if (form.role === 'school_admin' && !form.schoolId) {
      return setError('กรุณาเลือกโรงเรียนที่สังกัดสำหรับ School Admin');
    }

    try {
      setSaving(true);
      const saved = saveAdmin({
        ...form,
        id: admin?.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
      if (onSaved) onSaved({ type: isCreate ? 'create' : 'update', admin: form, all: saved });
      onClose();
    } catch (err) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการบันทึก Admin');
    } finally {
      setSaving(false);
    }
  };

  const grantedCount = Object.values(form.permissions || {}).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl grid place-items-center text-xl shadow-lg ${
              isDelete ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}>
              {isDelete ? '🗑️' : isCreate ? '➕' : '✏️'}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isDelete ? 'ยืนยันการลบผู้ดูแลระบบ (Admin)' : isCreate ? 'เพิ่มผู้ดูแลระบบใหม่ (Add Admin)' : 'แก้ไขข้อมูลและสิทธิ์ Admin'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isDelete ? `ต้องการลบบัญชี ${admin?.name} ออกจากระบบถาวรหรือไม่?` : 'กำหนดบทบาทและเลือก Check box สิทธิ์การใช้งานอย่างละเอียด'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 grid place-items-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        {isDelete ? (
          /* Delete Confirmation */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-slate-200 text-xs space-y-2">
              <div className="font-bold text-rose-300 text-sm">คำเตือน: การลบนี้ไม่สามารถเรียกคืนได้</div>
              <p>
                คุณกำลังจะลบสิทธิ์ผู้ดูแลระบบของ <b>{admin?.name}</b> ({admin?.email})
                ซึ่งสังกัด: <b>{admin?.schoolName || 'ระบบส่วนกลาง'}</b>
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="min-h-11 flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {saving ? 'กำลังลบ…' : '🗑️ ยืนยันลบ Admin นี้'}
              </button>
            </div>
          </div>
        ) : (
          /* Form for Add / Edit */
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* 1. ข้อมูลพื้นฐาน */}
            <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3">
              <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                <User size={14} /> 1. ข้อมูลผู้ดูแลระบบ (Admin Profile)
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">ชื่อ-นามสกุลผู้ดูแล *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น ดร. สมเกียรติ มั่นคง"
                    className="w-full min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">อีเมลเข้าใช้งาน (Email) *</label>
                  <input
                    type="email"
                    required
                    disabled={!isCreate && admin?.isSuperOwner}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="admin.email@example.com"
                    className="w-full min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white focus:border-sky-400 outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">บทบาทหน้าที่ (Role) *</label>
                  <select
                    value={form.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    disabled={!isCreate && admin?.isSuperOwner}
                    className="w-full min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white focus:border-sky-400 outline-none disabled:opacity-50"
                  >
                    {ADMIN_ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.icon} {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">สถานะบัญชี (Status)</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    disabled={!isCreate && admin?.isSuperOwner}
                    className="w-full min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white focus:border-sky-400 outline-none disabled:opacity-50"
                  >
                    <option value="active">Active (เปิดใช้งานปกติ)</option>
                    <option value="suspended">Suspended (ระงับสิทธิ์ชั่วคราว)</option>
                  </select>
                </div>

                {form.role === 'school_admin' && (
                  <div className="sm:col-span-2">
                    <label className="text-slate-300 font-bold block mb-1">สังกัดโรงเรียน (School Scope) *</label>
                    <select
                      required
                      value={form.schoolId}
                      onChange={e => handleSchoolChange(e.target.value)}
                      className="w-full min-h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white focus:border-sky-400 outline-none"
                    >
                      <option value="">-- โปรดเลือกโรงเรียนที่ดูแล --</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - {s.province || 'ไม่ระบุจังหวัด'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isCreate && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Key size={13} /> รหัสผ่านเริ่มต้นสำหรับ Admin ใหม่
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, initialPassword: `Admin@${Math.floor(1000 + Math.random() * 9000)}` })}
                        className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
                      >
                        🎲 สุ่มรหัสใหม่
                      </button>
                    </div>
                    <input
                      type="text"
                      value={form.initialPassword}
                      onChange={e => setForm({ ...form, initialPassword: e.target.value })}
                      className="w-full min-h-9 rounded-lg border border-white/10 bg-slate-950 px-2.5 font-mono text-white text-xs"
                      placeholder="เช่น Admin@2026"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      ส่งรหัสผ่านนี้ให้ผู้ดูแลระบบเพื่อเข้าสู่ระบบครั้งแรก
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Check box สิทธิต่างๆ */}
            <div className="bg-slate-950/70 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div>
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Shield size={14} /> 2. กำหนดสิทธิ์การใช้งาน (Permissions Matrix Checkboxes)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    เลือก Check box ตามสิทธิ์ที่ต้องการมอบหมาย ({grantedCount}/{ADMIN_PERMISSIONS.length} สิทธิ์ที่เปิดใช้งาน)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectAllPermissions(true)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    เลือกทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAllPermissions(false)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    ล้างทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={resetToRoleDefaults}
                    className="px-2 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-[10px] font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    ตามบทบาท
                  </button>
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ADMIN_PERMISSIONS.map(perm => {
                  const isChecked = Boolean(form.permissions?.[perm.id]);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'border-sky-500/50 bg-sky-500/10 text-white shadow-sm'
                          : 'border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/10 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 h-4 w-4 rounded accent-sky-400 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{perm.icon}</span>
                          <span className={`font-bold text-xs ${isChecked ? 'text-sky-300' : 'text-slate-300'}`}>
                            {perm.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {perm.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 flex-[2] rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'กำลังบันทึก…' : isCreate ? '🚀 สร้างและกำหนดสิทธิ์ Admin' : '💾 บันทึกการแก้ไขสิทธิ์ Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
