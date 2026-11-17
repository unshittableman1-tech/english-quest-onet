import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  XCircle,
  Plus,
  BookOpen,
  Filter,
  Trash2,
  Edit3,
  Sparkles,
  Send,
  Eye,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  listPracticeDrafts,
  reviewPracticeDraft,
  createPracticeDraft,
  deletePracticeDraft,
  updateDraftQuestion,
  PRACTICE_SKILLS,
} from '../../utils/personalizedPracticeReview';

const STATUS_CONFIG = {
  pending_review: {
    label: 'รอตรวจ',
    badgeClass: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    indicator: 'bg-amber-400',
  },
  approved: {
    label: 'อนุมัติแล้ว',
    badgeClass: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    indicator: 'bg-emerald-400',
  },
  rejected: {
    label: 'ไม่อนุมัติ',
    badgeClass: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
    indicator: 'bg-rose-400',
  },
};

const COMMON_REJECT_REASONS = [
  'โจทย์ยากหรือกำกวมเกินระดับชั้น ป.6',
  'ตัวเลือกคำตอบมีความคลุมเครือหรืออาจตอบได้มากกว่าหนึ่งข้อ',
  'คำอธิบายเฉลยยังไม่ละเอียดเพียงพอสำหรับการเรียนรู้ด้วยตนเอง',
  'มีเนื้อหาซ้ำซ้อนกับ Quest ที่นักเรียนเรียนไปแล้ว',
  'รูปแบบประโยคไม่สอดคล้องกับข้อสอบ O-NET ปัจจุบัน',
];

export default function TeacherPracticeReview({
  schoolId = 'BNS69',
  schoolName = 'โรงเรียนบ้านน้ำใส',
  schoolCode = 'BNS69',
  activeClass = 'all',
  showToast,
}) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocalStaging, setIsLocalStaging] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Filters & Views
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending_review, approved, rejected
  const [classFilter, setClassFilter] = useState(activeClass === 'all' ? 'all' : activeClass);
  const [expandedDrafts, setExpandedDrafts] = useState(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rejectingDraft, setRejectingDraft] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null); // { draftId, questionIndex, question }

  // New draft form state
  const [newSkill, setNewSkill] = useState(PRACTICE_SKILLS[0].id);
  const [newDifficulty, setNewDifficulty] = useState('ปานกลาง (Medium)');
  const [newCount, setNewCount] = useState(4);
  const [newTargetClass, setNewTargetClass] = useState('ทุกห้อง');
  const [newTopic, setNewTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPracticeDrafts(schoolId);
      setDrafts(Array.isArray(result?.drafts) ? result.drafts : []);
      setIsLocalStaging(!!result?.isLocalStaging);
    } catch (err) {
      console.error('Error loading practice drafts:', err);
      showToast?.('เกิดข้อผิดพลาดในการโหลดชุดฝึก', 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Sync class filter if activeClass changes from parent
  useEffect(() => {
    if (activeClass && activeClass !== 'all') {
      setClassFilter(activeClass);
    }
  }, [activeClass]);

  // Toggle card expansion
  const toggleExpand = (draftId) => {
    setExpandedDrafts((prev) => {
      const next = new Set(prev);
      if (next.has(draftId)) next.delete(draftId);
      else next.add(draftId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDrafts(new Set(drafts.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedDrafts(new Set());
  };

  // Decide action (Approve / Reject)
  const handleApprove = async (draft) => {
    setBusyId(draft.id);
    try {
      await reviewPracticeDraft(schoolId, draft.id, 'approved', '', 'คุณครูผู้สอน');
      showToast?.('✅ อนุมัติชุดฝึกเรียบร้อย (พร้อมส่งให้นักเรียนฝึก โดยไม่คิด XP)', 'success');
      await load();
    } catch (error) {
      showToast?.(error.message || 'ไม่สามารถอนุมัติได้', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const openRejectModal = (draft) => {
    setRejectingDraft(draft);
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      showToast?.('กรุณาระบุเหตุผลในการไม่อนุมัติ', 'error');
      return;
    }
    setBusyId(rejectingDraft.id);
    try {
      await reviewPracticeDraft(schoolId, rejectingDraft.id, 'rejected', rejectReason.trim(), 'คุณครูผู้ตรวจ');
      showToast?.('บันทึกการไม่อนุมัติและเหตุผลทางวิชาการเรียบร้อย', 'info');
      setRejectingDraft(null);
      await load();
    } catch (error) {
      showToast?.(error.message || 'ไม่สามารถบันทึกได้', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (draftId) => {
    if (!window.confirm('คุณต้องการลบชุดฝึกนี้ใช่หรือไม่?')) return;
    try {
      await deletePracticeDraft(schoolId, draftId);
      showToast?.('ลบชุดฝึกเรียบร้อยแล้ว', 'info');
      await load();
    } catch (error) {
      showToast?.('ไม่สามารถลบได้', 'error');
    }
  };

  // Create new draft
  const handleCreateDraft = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await createPracticeDraft({
        schoolId,
        skill: newSkill,
        difficulty: newDifficulty,
        count: Number(newCount),
        targetClass: newTargetClass,
        topic: newTopic.trim(),
        createdBy: 'คุณครูผู้สอน',
      });
      showToast?.('✨ สร้างชุดฝึก AI ใหม่เข้าสู่คิวรอตรวจเรียบร้อยแล้ว', 'success');
      setShowCreateModal(false);
      setNewTopic('');
      await load();
    } catch (error) {
      showToast?.('เกิดข้อผิดพลาดในการสร้างชุดฝึก', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save edited question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      await updateDraftQuestion(schoolId, editingQuestion.draftId, editingQuestion.questionIndex, {
        prompt: editingQuestion.prompt,
        passage: editingQuestion.passage,
        options: editingQuestion.options,
        answerIndex: Number(editingQuestion.answerIndex),
        explanation: editingQuestion.explanation,
        difficulty: editingQuestion.difficulty,
      });
      showToast?.('บันทึกการแก้ไขข้อคำถามเรียบร้อย', 'success');
      setEditingQuestion(null);
      await load();
    } catch (error) {
      showToast?.('ไม่สามารถบันทึกข้อคำถามได้', 'error');
    }
  };

  // Print executive summary
  const handlePrintSummary = () => {
    window.print();
  };

  // Filtered drafts
  const filteredDrafts = drafts.filter((draft) => {
    if (statusFilter !== 'all' && draft.status !== statusFilter) return false;
    if (classFilter !== 'all' && draft.targetClass !== 'ทุกห้อง' && draft.targetClass !== classFilter) return false;
    return true;
  });

  const pendingCount = drafts.filter((d) => d.status === 'pending_review').length;
  const approvedCount = drafts.filter((d) => d.status === 'approved').length;
  const rejectedCount = drafts.filter((d) => d.status === 'rejected').length;

  return (
    <section className="space-y-6" aria-labelledby="practice-review-title">
      {/* ── Top Header Banner ──── */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles size={12} /> AI Personalized Practice
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <ShieldCheck size={12} /> Teacher Review Required
              </span>
            </div>
            <h2 id="practice-review-title" className="mt-2 text-2xl font-black text-white flex items-center gap-2">
              <span>ตรวจชุดฝึก AI ก่อนส่งให้นักเรียน</span>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              ตรวจสอบความถูกต้องของโจทย์ ตัวเลือก เฉลย คำอธิบาย และระดับความยากตามตัวชี้วัด สทศ. ป.6
              เนื้อหาจะไม่ถึงมือนักเรียนจนกว่าครูในโรงเรียนจะอนุมัติ และชุดฝึกนี้เน้นการซ่อมเสริมทักษะ{' '}
              <strong className="text-amber-300">ไม่คิด XP</strong> เพื่อความยุติธรรมในการจัดอันดับ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <span>สร้างชุดฝึก AI ใหม่</span>
            </button>
            <button
              type="button"
              onClick={handlePrintSummary}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 text-sm font-bold text-slate-200 transition-colors shadow cursor-pointer"
              title="พิมพ์สรุปรายการชุดฝึกเพื่อเสนอผู้บริหาร"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3.5 text-sm font-bold text-slate-200 transition-colors shadow disabled:opacity-50 cursor-pointer"
              title="รีเฟรชรายการ"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* System Active Status Notice */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">
              ระบบตรวจชุดฝึก AI พร้อมใช้งาน (School Staging Active: {schoolName} · {schoolCode})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={expandAll} className="hover:text-sky-300 transition-colors">
              ขยายดูทุกข้อ
            </button>
            <span>•</span>
            <button type="button" onClick={collapseAll} className="hover:text-sky-300 transition-colors">
              ย่อทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Statistics Cards ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-950/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-bold text-slate-400">ชุดฝึกทั้งหมด</div>
          <div className="mt-1 text-2xl font-black text-white">{drafts.length} <span className="text-xs font-normal text-slate-400">ชุด</span></div>
          <div className="mt-1 text-[11px] text-sky-400 flex items-center gap-1">
            <BookOpen size={12} /> ครอบคลุม 5 หมวดทักษะ
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('pending_review')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending_review'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-950/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            รอตรวจก่อนส่ง
          </div>
          <div className="mt-1 text-2xl font-black text-amber-300">
            {pendingCount} <span className="text-xs font-normal text-amber-200/70">ชุด</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-200/80">ต้องให้ครูอนุมัติก่อน</div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-bold text-emerald-300">อนุมัติแล้ว (พร้อมส่ง)</div>
          <div className="mt-1 text-2xl font-black text-emerald-300">
            {approvedCount} <span className="text-xs font-normal text-emerald-200/70">ชุด</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-300/80">มอบหมายให้นักเรียนได้</div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-500/15 border-rose-500/50 shadow-lg shadow-rose-950/20'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-bold text-rose-300">ไม่อนุมัติ / ส่งกลับ</div>
          <div className="mt-1 text-2xl font-black text-rose-300">
            {rejectedCount} <span className="text-xs font-normal text-rose-200/70">ชุด</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-300/80">มีบันทึกเหตุผลกำกับ</div>
        </div>
      </div>

      {/* ── Toolbar: Status & Classroom Filter ──── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={13} /> สถานะ:
          </span>
          {[
            { id: 'all', label: `ทั้งหมด (${drafts.length})` },
            { id: 'pending_review', label: `รอตรวจ (${pendingCount})` },
            { id: 'approved', label: `อนุมัติแล้ว (${approvedCount})` },
            { id: 'rejected', label: `ไม่อนุมัติ (${rejectedCount})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">ห้องเป้าหมาย:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">ทุกห้องเรียน</option>
            <option value="ป.6/1">ห้อง ป.6/1</option>
            <option value="ป.6/2">ห้อง ป.6/2</option>
          </select>
        </div>
      </div>

      {/* ── Drafts List ──── */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">
          <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-sky-400" />
          กำลังโหลดชุดฝึก AI...
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h4 className="text-base font-bold text-white">ไม่พบชุดฝึกตามตัวกรองที่เลือก</h4>
          <p className="mt-1 text-xs text-slate-400">
            {statusFilter !== 'all' || classFilter !== 'all'
              ? 'ลองเปลี่ยนตัวกรอง หรือกดปุ่ม "สร้างชุดฝึก AI ใหม่"'
              : 'ยังไม่มีชุดฝึกในระบบ'}
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
          >
            <Plus size={16} />
            <span>สร้างชุดฝึก AI ทันที</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const isExpanded = expandedDrafts.has(draft.id);
            const statusMeta = STATUS_CONFIG[draft.status] || STATUS_CONFIG.pending_review;

            return (
              <article
                key={draft.id}
                className={`rounded-3xl border transition-all ${
                  draft.status === 'pending_review'
                    ? 'border-amber-500/30 bg-slate-900 shadow-lg shadow-amber-950/10'
                    : draft.status === 'approved'
                    ? 'border-emerald-500/30 bg-slate-900/90 shadow-lg shadow-emerald-950/10'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Draft Card Header */}
                <div className="p-5 md:p-6 flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusMeta.badgeClass}`}>
                        <span className={`h-2 w-2 rounded-full ${statusMeta.indicator}`} />
                        {statusMeta.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {draft.targetClass || 'ทุกห้อง'}
                      </span>
                      {draft.standard && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {draft.standard}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{draft.skillLabel || draft.skill}</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>📝 {draft.questions.length} ข้อคำถาม</span>
                      <span>•</span>
                      <span>
                        สร้างเมื่อ {new Date(draft.createdAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </span>
                      {draft.reviewedBy && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-300">
                            ตรวจโดย: {draft.reviewedBy} (
                            {new Date(draft.reviewedAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Reason if rejected */}
                    {draft.status === 'rejected' && draft.reviewReason && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                        <strong className="font-bold text-rose-300">เหตุผลที่ไม่อนุมัติ:</strong> {draft.reviewReason}
                      </div>
                    )}
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(draft.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>{isExpanded ? 'ย่อโจทย์' : 'ดูโจทย์ทั้งชุด'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(draft.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="ลบชุดฝึกนี้"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Question Details (Expanded view) */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 md:p-6 bg-slate-950/50 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
                      <span>รายการข้อสอบ {draft.questions.length} ข้อ</span>
                      <span className="text-amber-400">⚠️ ตรวจคำตอบและคำอธิบายก่อนอนุมัติ</span>
                    </div>

                    <ol className="space-y-4">
                      {draft.questions.map((question, qIdx) => (
                        <li
                          key={question.id || qIdx}
                          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 relative group"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="font-black text-sm text-white flex items-center gap-2">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-xs font-bold text-sky-400">
                                {qIdx + 1}
                              </span>
                              <span>{question.prompt}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {question.difficulty && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                                  {question.difficulty}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingQuestion({
                                    draftId: draft.id,
                                    questionIndex: qIdx,
                                    prompt: question.prompt,
                                    passage: question.passage || '',
                                    options: [...question.options],
                                    answerIndex: question.answerIndex,
                                    explanation: question.explanation,
                                    difficulty: question.difficulty || 'ปานกลาง (Medium)',
                                  })
                                }
                                className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors"
                                title="แก้ไขข้อนี้"
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </div>

                          {question.passage && (
                            <div className="my-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs leading-relaxed text-slate-200 font-serif">
                              {question.passage}
                            </div>
                          )}

                          {/* Options Grid */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === question.answerIndex;
                              return (
                                <div
                                  key={oIdx}
                                  className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                                    isCorrect
                                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-bold shadow-sm'
                                      : 'border-slate-800 bg-slate-950/40 text-slate-300'
                                  }`}
                                >
                                  <span>
                                    <strong className="mr-2 text-slate-400">{String.fromCharCode(65 + oIdx)}.</strong>
                                    {opt}
                                  </span>
                                  {isCorrect && (
                                    <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                                      เฉลย
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800/70 text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                              <span className="text-violet-400 font-bold shrink-0">คำอธิบาย:</span>
                              <p>{question.explanation}</p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Review Action Controls */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    {draft.status === 'pending_review' ? (
                      <span className="text-amber-300 font-semibold">
                        ⏳ รอผลการตรวจอนุมัติจากครูผู้สอนเพื่อเปิดให้นักเรียนเข้าฝึก
                      </span>
                    ) : draft.status === 'approved' ? (
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> ผ่านการรับรองทางวิชาการแล้ว พร้อมมอบหมาย
                      </span>
                    ) : (
                      <span className="text-rose-300 font-semibold flex items-center gap-1.5">
                        <XCircle size={14} /> ชุดฝึกนี้ถูกระงับ ไม่ส่งถึงนักเรียน
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {draft.status === 'pending_review' ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === draft.id}
                          onClick={() => openRejectModal(draft)}
                          className="inline-flex min-h-9 items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          <XCircle size={15} />
                          <span>ไม่อนุมัติ</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyId === draft.id}
                          onClick={() => handleApprove(draft)}
                          className="inline-flex min-h-9 items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          <span>อนุมัติชุดฝึกนี้</span>
                        </button>
                      </>
                    ) : draft.status === 'approved' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            showToast?.('📤 มอบหมายชุดฝึกนี้ไปยังมุมงานนักเรียนเรียบร้อย (ไม่คิด XP)', 'success');
                          }}
                          className="inline-flex min-h-9 items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Send size={14} />
                          <span>มอบหมายให้นักเรียน</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyId === draft.id}
                          onClick={() => openRejectModal(draft)}
                          className="inline-flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <span>เพิกถอน</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === draft.id}
                        onClick={() => handleApprove(draft)}
                        className="inline-flex min-h-9 items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>เปลี่ยนเป็นอนุมัติ</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Modal: Create New AI Practice Draft ──── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">สร้างชุดฝึก AI ใหม่</h3>
                  <p className="text-xs text-slate-400">ระบบจะสร้างชุดฝึกร่างตามตัวชี้วัดเข้าสู่คิวรอตรวจของครู</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">เลือกหมวดทักษะ / ตัวชี้วัด O-NET:</label>
                <select
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-medium cursor-pointer"
                >
                  {PRACTICE_SKILLS.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.icon} {skill.name} ({skill.standard})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">หัวข้อเฉพาะที่ต้องการเน้น (ไม่บังคับ):</label>
                <input
                  type="text"
                  placeholder="เช่น กิจวัตรตอนเช้า, ป้ายความปลอดภัย, บทสนทนาถามทาง"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ระดับความยาก:</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="ง่าย (Easy)">ง่าย (Easy)</option>
                    <option value="ปานกลาง (Medium)">ปานกลาง (Medium)</option>
                    <option value="ท้าทาย (Challenging)">ท้าทาย (Challenging)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">จำนวนข้อคำถาม:</label>
                  <select
                    value={newCount}
                    onChange={(e) => setNewCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="3">3 ข้อ</option>
                    <option value="4">4 ข้อ</option>
                    <option value="5">5 ข้อ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ห้องเรียนเป้าหมาย:</label>
                <select
                  value={newTargetClass}
                  onChange={(e) => setNewTargetClass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none cursor-pointer"
                >
                  <option value="ทุกห้อง">ทุกห้อง (ป.6)</option>
                  <option value="ป.6/1">ห้อง ป.6/1</option>
                  <option value="ป.6/2">ห้อง ป.6/2</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                🛡️ <strong>เกณฑ์ความปลอดภัยทางวิชาการ:</strong> ชุดฝึกที่สร้างขึ้นจะถูกจัดเก็บในสถานะ{' '}
                <strong>“รอตรวจ”</strong> เสมอ โดยจะยังไม่ส่งถึงนักเรียนจนกว่าครูผู้สอนจะกดอนุมัติ
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-950/30 hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>สร้างชุดฝึกทันที</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Reject Draft with Reason ──── */}
      {rejectingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
                <XCircle size={18} />
                <span>ระบุเหตุผลในการไม่อนุมัติชุดฝึก</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingDraft(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ชุดฝึก: <strong className="text-white">{rejectingDraft.skillLabel || rejectingDraft.skill}</strong>
              <br />
              โปรดระบุเหตุผลหรือข้อเสนอแนะเพื่อเป็นหลักฐานทางวิชาการและปรับปรุงต่อไป:
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">เลือกเหตุผลด่วน:</span>
              <div className="flex flex-col gap-1.5">
                {COMMON_REJECT_REASONS.map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    className="text-left text-xs p-2 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    • {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">หรือพิมพ์ระบุเพิ่มเติม:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผลการไม่อนุมัติ..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingDraft(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                ยืนยันการไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Question Inline ──── */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-sky-400" />
                <h3 className="text-base font-black text-white">
                  แก้ไขข้อคำถามที่ {editingQuestion.questionIndex + 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">โจทย์คำถาม:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.prompt}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">บทอ่านสั้น / Passage (ถ้ามี):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.passage}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, passage: e.target.value })}
                  placeholder="เว้นว่างไว้หากไม่มีบทอ่าน..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-serif text-[11px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-300">ตัวเลือกและคำตอบที่ถูกต้อง:</label>
                {editingQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editingQuestion.answerIndex === idx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, answerIndex: idx })}
                      className="cursor-pointer"
                      title="เลือกเป็นคำตอบที่ถูกต้อง"
                    />
                    <span className="font-bold text-slate-400 w-5">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2 outline-none"
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">คำอธิบายเฉลยภาษาไทย (Explanation):</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
