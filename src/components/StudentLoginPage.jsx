import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { getAllSchools, getSchoolByCode } from '../utils/schoolStorage';
import CuteUpdateModal from './CuteUpdateModal';
import EnglishQuestLogo from './landing/EnglishQuestLogo';

const STUDENT_SCHOOL_KEY = 'eq_onet_student_school';

export default function StudentLoginPage() {
  const { navigate, handleLogin } = useApp();
  const [form, setForm] = useState({ name: '', class: '6/2', number: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // School Selection State
  const [schools, setSchools] = useState(() => getAllSchools());
  const [selectedSchool, setSelectedSchool] = useState(() => {
    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlSchoolCode = params.get('school') || params.get('schoolCode');
    if (urlSchoolCode) {
      const found = getSchoolByCode(urlSchoolCode);
      if (found) {
        localStorage.setItem(STUDENT_SCHOOL_KEY, JSON.stringify(found));
        return found;
      }
    }

    // 2. Check localStorage
    try {
      const saved = localStorage.getItem(STUDENT_SCHOOL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}

    // 3. Fallback to first active school (BNS01 default)
    const all = getAllSchools();
    return all.find(s => s.code === 'BNS01') || all[0] || null;
  });

  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');

  // Auto-hide update modal if page was just refreshed/updated via URL parameters
  const [showUpdateModal, setShowUpdateModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has('route') && !params.has('refresh') && !params.has('updated');
  });

  // Handle URL change or popstate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('school') || params.get('schoolCode');
    if (urlCode) {
      const found = getSchoolByCode(urlCode);
      if (found) {
        setSelectedSchool(found);
        localStorage.setItem(STUDENT_SCHOOL_KEY, JSON.stringify(found));
      }
    }
  }, []);

  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    localStorage.setItem(STUDENT_SCHOOL_KEY, JSON.stringify(school));
    setShowSchoolModal(false);
  };

  const handleNext = async () => {
    const e = {};
    if (!form.class) e.class = 'กรุณาเลือกชั้นเรียน';
    if (!form.number) e.number = 'กรุณากรอกเลขที่';
    
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    
    setLoading(true);
    try {
      const { getStudentByClassAndNumber, saveStudent } = await import('../utils/storage');
      const numStr = form.number.toString().trim();
      const classStr = form.class.trim();
      const schoolCode = selectedSchool?.code || null;

      console.log('[Login] Searching student for school:', schoolCode, 'class:', classStr, 'number:', numStr);

      let student = await getStudentByClassAndNumber(classStr, numStr, schoolCode);
      
      if (!student && classStr.startsWith('ป.')) {
        const altClass = classStr.substring(2);
        student = await getStudentByClassAndNumber(altClass, numStr, schoolCode);
      }
      
      if (!student && !classStr.startsWith('ป.')) {
        const altClass = 'ป.' + classStr;
        student = await getStudentByClassAndNumber(altClass, numStr, schoolCode);
      }

      console.log('[Login] Found student:', student);
      
      if (student) {
        const studentData = {
          ...student,
          school_code: selectedSchool?.code || student.school_code || 'BNS01',
          school_id: selectedSchool?.id || student.school_id || 'sch_bns_01',
          school_name: selectedSchool?.name || student.school_name || 'โรงเรียนบ้านนาสาร'
        };
        const saved = await saveStudent(studentData);
        handleLogin(saved);
      } else {
        setErrors({
          number: `ไม่พบเลขที่ ${numStr} ในชั้น ${classStr} ${selectedSchool ? `ของ ${selectedSchool.name}` : ''} กรุณาตรวจสอบข้อมูลหรือแจ้งครู`
        });
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setErrors({ number: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  // Filter schools for modal
  const filteredSchools = schools.filter(s => {
    return (
      s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(schoolSearch.toLowerCase()) ||
      (s.province && s.province.toLowerCase().includes(schoolSearch.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">

      {/* Cute Update Modal */}
      <CuteUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />

      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-300/20 blur-3xl pointer-events-none rounded-b-full" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Top actions bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn-ghost flex items-center gap-2 text-sm font-semibold px-4 py-2"
            onClick={() => navigate('landing')}
          >
            <UIIcon value={"←"} /> กลับหน้าหลัก
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-4 w-64 max-w-full"><EnglishQuestLogo /></div>
          <h1 className="text-2xl font-black text-amber-800">กรอกข้อมูลนักเรียน</h1>
          <p className="text-slate-500 text-xs mt-1">เพื่อบันทึกคะแนนและประเมินผลความพร้อม O-NET</p>
        </div>

        {step === 1 && (
          <div className="glass-card p-6 space-y-4 shadow-xl">

            {/* School Banner Card */}
            {selectedSchool ? (
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-2xl"><UIIcon value={"🏫"} /></span>
                  <div className="truncate">
                    <div className="font-black text-slate-800 text-xs truncate">
                      {selectedSchool.name}
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono font-medium">
                      รหัส รร: <span className="font-bold">{selectedSchool.code}</span> {selectedSchool.province ? `• ${selectedSchool.province}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(true)}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-xl border border-amber-500/30 transition-all shrink-0"
                  title="เปลี่ยนโรงเรียน"
                >
                  สลับ รร.
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSchoolModal(true)}
                className="w-full bg-amber-500/15 border-2 border-dashed border-amber-500/40 rounded-2xl p-3 text-center text-xs font-bold text-amber-800 hover:bg-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span><UIIcon value={"🏫"} /></span>
                <span>คลิกเพื่อเลือกโรงเรียนของคุณ</span>
              </button>
            )}

            <p className="text-slate-500 text-xs text-center">เลือกระดับชั้นและพิมพ์เลขที่เพื่อเข้าสู่ระบบ</p>

            {/* Class & Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <UIIcon value={"🏫"} /> ชั้น <span className="text-rose-500">*</span>
                </label>
                <select
                  className="input-field appearance-none cursor-pointer text-sm"
                  value={form.class}
                  onChange={handleChange('class')}
                >
                  <option className="text-slate-900" value="" disabled>-- เลือกชั้น --</option>
                  <option className="text-slate-900" value="6/1">ป.6/1</option>
                  <option className="text-slate-900" value="6/2">ป.6/2</option>
                  <option className="text-slate-900" value="6/3">ป.6/3</option>
                  <option className="text-slate-900" value="6/4">ป.6/4</option>
                  <option className="text-slate-900" value="6/5">ป.6/5</option>
                  <option className="text-slate-900" value="6/6">ป.6/6</option>
                </select>
                {errors.class && <p className="text-rose-500 text-[11px] mt-1"><UIIcon value={"⚠️"} /> {errors.class}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <UIIcon value={"🔢"} /> เลขที่ <span className="text-rose-500">*</span>
                </label>
                <input
                  className="input-field text-sm"
                  type="number"
                  placeholder="เช่น 1"
                  min="1"
                  max="60"
                  value={form.number}
                  onChange={handleChange('number')}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
                {errors.number && <p className="text-rose-500 text-[11px] mt-1 leading-tight"><UIIcon value={"⚠️"} /> {errors.number}</p>}
              </div>
            </div>

            <button
              className="btn-primary w-full text-base py-3.5 mt-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              onClick={handleNext}
              disabled={loading}
            >
              <UIIconText value={loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'} />
            </button>
          </div>
        )}

      </div>

      {/* ── School Selection Modal ──────────────────────────────────── */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm p-5 rounded-3xl shadow-2xl space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <span><UIIcon value={"🏫"} /></span>
                <span>เลือกโรงเรียนของคุณ</span>
              </h3>
              <button
                onClick={() => setShowSchoolModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                <UIIcon value={"✕"} />
              </button>
            </div>

            {/* Search Box */}
            <input
              type="text"
              placeholder="🔍 ค้นหาชื่อโรงเรียน หรือ รหัส (เช่น BNS01)..."
              value={schoolSearch}
              onChange={e => setSchoolSearch(e.target.value)}
              className="w-full bg-white/90 border border-amber-300/80 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              autoFocus
            />

            {/* School List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredSchools.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ไม่พบโรงเรียนที่ค้นหา
                </div>
              ) : (
                filteredSchools.map(sch => {
                  const isSelected = selectedSchool?.id === sch.id;
                  return (
                    <button
                      key={sch.id}
                      onClick={() => handleSelectSchool(sch)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-white/80 hover:bg-amber-50/80 border-amber-200/60 text-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-bold text-xs truncate leading-tight">
                          {sch.name}
                        </div>
                        <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>
                          {sch.area || sch.province}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg shrink-0 font-bold ${
                        isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {sch.code}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowSchoolModal(false)}
              className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
