import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, LockKeyhole, CheckCircle, AlertTriangle, Layers, BookOpen, Sparkles } from 'lucide-react';
import { pretestV2Questions } from '../../data/pretestV2';
import { BLUEPRINT_2569_STRUCTURE, blueprint32Questions } from '../../data/pretestBlueprint32';
import { POSTTEST_BLUEPRINT_2569_STRUCTURE, posttest32Questions } from '../../data/posttestBlueprint32';
import QuestionStimulus from '../QuestionStimulus';
import '../../styles/pretestTeacherPreview.css';

const VERIFICATION_STORAGE_KEY = 'eq_teacher_indicator_reviews_v1';

export default function PretestTeacherPreview() {
  const [activeSet, setActiveSet] = useState('v2'); // 'v2' | 'blueprint32' | 'posttest32'
  const [index, setIndex] = useState(0);
  const [verifications, setVerifications] = useState(() => {
    try {
      const saved = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const isV2 = activeSet === 'v2';
  const isPostTest = activeSet === 'posttest32';

  const questionsList = isV2
    ? pretestV2Questions
    : isPostTest
    ? posttest32Questions
    : blueprint32Questions;

  const currentIdx = Math.min(index, questionsList.length - 1);
  const rawItem = questionsList[currentIdx];
  const questionId = isV2 ? `pretest-v2-${currentIdx + 1}` : rawItem.id;
  const question = { ...rawItem, id: questionId };

  // Handle active set toggle
  const handleSelectSet = (setKey) => {
    setActiveSet(setKey);
    setIndex(0);
  };

  // Indicator verification
  const itemVerification = verifications[questionId] || null;
  const [selectedIndicator, setSelectedIndicator] = useState(rawItem.candidateIndicator || '');

  useEffect(() => {
    setSelectedIndicator(itemVerification?.indicator || rawItem.candidateIndicator || '');
  }, [questionId, itemVerification, rawItem]);

  const handleSaveVerification = () => {
    const next = {
      ...verifications,
      [questionId]: {
        indicator: selectedIndicator,
        standard: rawItem.standard,
        verifiedAt: new Date().toISOString(),
        status: 'verified_by_teacher',
      },
    };
    setVerifications(next);
    try {
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage quota or private mode fallback
    }
  };

  return (
    <section className="pretest-review" aria-labelledby="pretest-review-title">
      {/* Top Toggle Bar */}
      <div className="pretest-review-set-selector" role="tablist" aria-label="เลือกชุดข้อสอบสำหรับตรวจทาน">
        <button
          type="button"
          role="tab"
          aria-selected={isV2}
          className={`pretest-set-tab ${isV2 ? 'is-active' : ''}`}
          onClick={() => handleSelectSet('v2')}
        >
          <Layers size={15} aria-hidden="true" />
          <span>ชุดที่ใช้อยู่ (pretest-v2 · 20 ข้อ)</span>
          <span className="pretest-set-badge">ใช้งานจริง</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSet === 'blueprint32'}
          className={`pretest-set-tab ${activeSet === 'blueprint32' ? 'is-active' : ''}`}
          onClick={() => handleSelectSet('blueprint32')}
        >
          <BookOpen size={15} aria-hidden="true" />
          <span>Pre-Test 2569 (ร่าง 32 ข้อ)</span>
          <span className="pretest-set-badge pretest-set-badge-draft">ผัง สทศ.</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isPostTest}
          className={`pretest-set-tab ${isPostTest ? 'is-active' : ''}`}
          onClick={() => handleSelectSet('posttest32')}
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>Post-Test 2569 คู่ขนาน (ร่าง 32 ข้อ)</span>
          <span className="pretest-set-badge pretest-set-badge-draft">คู่ขนาน</span>
        </button>
      </div>

      <header className="pretest-review-header">
        <div>
          <p className="pretest-review-kicker">
            <ClipboardList size={16} aria-hidden="true" /> ตรวจชุดข้อสอบ
          </p>
          <h3 id="pretest-review-title">
            {isV2
              ? 'Pre-Test ก่อนเรียน'
              : isPostTest
              ? 'แบบทดสอบหลังเรียน (Post-Test) คู่ขนาน 2569'
              : 'ผังโครงสร้างข้อสอบ O-NET 2569 (แบบร่าง 32 ข้อ)'}
          </h3>
          <p>
            {isV2
              ? `ชุดที่ใช้อยู่ pretest-v2 · ${pretestV2Questions.length} ข้อ · 4 ตัวเลือก`
              : isPostTest
              ? `${POSTTEST_BLUEPRINT_2569_STRUCTURE.name} · 32 ข้อ · คะแนนเต็ม 100 (ข้อละ 3.125 คะแนน)`
              : `${BLUEPRINT_2569_STRUCTURE.name} · 32 ข้อ · คะแนนเต็ม 100 (ข้อละ 3.125 คะแนน)`}
          </p>
        </div>
        <span className="pretest-review-private">
          <LockKeyhole size={14} aria-hidden="true" /> มุมมองสำหรับครู
        </span>
      </header>

      {isV2 ? (
        <div className="pretest-review-notice">
          <strong>รอตรวจสอบทางวิชาการ</strong>
          <p>รหัสมาตรฐานและเฉลยด้านล่างเป็นข้อมูลเดิมของชุดข้อสอบ ยังไม่ได้รับรองความถูกต้องของตัวชี้วัดหรือความสอดคล้องกับ Blueprint</p>
        </div>
      ) : isPostTest ? (
        <div className="pretest-review-notice pretest-review-notice-blueprint">
          <strong>แบบทดสอบคู่ขนาน (Parallel Form) สำหรับวัดพัฒนาการหลังเรียน</strong>
          <p>
            ข้อสอบชุดนี้สร้างคู่ขนานกับ Pre-Test 32 ข้อตามผัง สทศ. (ต 1.1 ถึง ต 4.1) โดยมีระดับความยากและตัวชี้วัดเทียบเคียง 1 ต่อ 1 เพื่อใช้วัดคะแนนพัฒนาการจริง (Growth Score)
          </p>
        </div>
      ) : (
        <div className="pretest-review-notice pretest-review-notice-blueprint">
          <strong>ร่างตามโครงสร้างผัง สทศ. (TB_63EngP6 O_NET69.pdf)</strong>
          <p>
            ข้อสอบชุดนี้เตรียมรองรับโครงสร้าง 32 ข้อ 100 คะแนนเต็ม ตัวชี้วัดที่ระบุเป็นร่างเบื้องต้น คุณครูสามารถตรวจเฉลยและกดยืนยันตัวชี้วัดรายข้อได้ด้านล่าง
          </p>
        </div>
      )}

      <div className="pretest-review-layout">
        <nav className="pretest-review-nav" aria-label="เลือกข้อสอบ">
          <div className="pretest-review-nav-heading">
            <strong>ข้อสอบทั้งหมด</strong>
            <span>{currentIdx + 1} / {questionsList.length}</span>
          </div>
          <div className="pretest-review-number-grid">
            {questionsList.map((qItem, i) => {
              const qId = isV2 ? `pretest-v2-${i + 1}` : qItem.id;
              const isItemVerified = !isV2 && Boolean(verifications[qId]);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`ดูข้อ ${i + 1}`}
                  aria-current={i === currentIdx ? 'true' : undefined}
                  className={`${i === currentIdx ? 'is-active' : ''} ${isItemVerified ? 'is-verified' : ''}`}
                >
                  {i + 1}
                  {isItemVerified && <span className="verified-dot" title="ครูยืนยันแล้ว" />}
                </button>
              );
            })}
          </div>
          <p>เลือกหมายเลขเพื่อดูรายละเอียด</p>
        </nav>

        <article className="pretest-review-card" aria-label={`ข้อสอบข้อ ${currentIdx + 1}`}>
          <div className="pretest-review-card-top">
            <div>
              <span>ข้อที่ {String(currentIdx + 1).padStart(2, '0')} / {questionsList.length}</span>
              <small>รหัสข้อ {questionId}</small>
            </div>
            {isV2 ? (
              <span className="pretest-review-status">รอตรวจสอบตัวชี้วัด</span>
            ) : itemVerification ? (
              <span className="pretest-review-status is-verified">
                <CheckCircle size={13} aria-hidden="true" /> ยืนยันแล้ว ({itemVerification.indicator})
              </span>
            ) : (
              <span className="pretest-review-status">
                <AlertTriangle size={13} aria-hidden="true" /> รอตรวจสอบตัวชี้วัด
              </span>
            )}
          </div>

          {/* Stimulus or Passage */}
          {rawItem.passage && (
            <div className="pretest-review-passage">
              <strong className="pretest-passage-label">บทความสำหรับอ่าน (Passage):</strong>
              <p>{rawItem.passage}</p>
            </div>
          )}

          <QuestionStimulus key={question.id} question={question} />

          <h4>{rawItem.prompt}</h4>

          <ol className="pretest-review-options">
            {rawItem.options.map((option, i) => (
              <li key={i} className={i === rawItem.answer ? 'is-answer' : ''}>
                <span className="pretest-review-letter">{String.fromCharCode(65 + i)}</span>
                <div>
                  {typeof option === 'string' ? option : <img src={option.image} alt={option.alt} />}
                  {i === rawItem.answer && (
                    <strong className="pretest-review-answer">
                      {isV2 ? 'เฉลยเดิม · รอตรวจสอบ' : 'เฉลยที่ระบุ'}
                    </strong>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {/* Explanation if available */}
          {rawItem.explanation && (
            <div className="pretest-review-explanation">
              <strong>คำอธิบายเฉลย:</strong>
              <p>{rawItem.explanation}</p>
            </div>
          )}

          {/* Metadata & Verification Panel */}
          {isV2 ? (
            <dl className="pretest-review-metadata">
              <div>
                <dt>มาตรฐานที่ระบุเดิม</dt>
                <dd>{rawItem.standard} <small>· ยังไม่ยืนยัน</small></dd>
              </div>
              <div>
                <dt>ตัวชี้วัด</dt>
                <dd>รอตรวจสอบตัวชี้วัด</dd>
              </div>
              <div>
                <dt>ทักษะ / ปี Blueprint</dt>
                <dd>รอตรวจสอบ</dd>
              </div>
            </dl>
          ) : (
            <div className="pretest-review-indicator-panel">
              <div className="indicator-panel-info">
                <div>
                  <span className="label">มาตรฐานการเรียนรู้:</span>
                  <strong>{rawItem.standard}</strong>
                </div>
                <div>
                  <span className="label">ตัวชี้วัดร่าง:</span>
                  <strong>{rawItem.candidateIndicator || 'รอตรวจสอบ'}</strong>
                </div>
                <div>
                  <span className="label">คะแนนเต็ม:</span>
                  <strong>3.125 คะแนน</strong>
                </div>
              </div>

              <div className="indicator-panel-actions">
                <label htmlFor="indicator-select" className="indicator-label">
                  ครูตรวจยืนยันตัวชี้วัด:
                </label>
                <div className="indicator-action-row">
                  <input
                    id="indicator-select"
                    type="text"
                    value={selectedIndicator}
                    onChange={(e) => setSelectedIndicator(e.target.value)}
                    placeholder="เช่น ป.6/1, ป.6/3"
                    className="indicator-input"
                  />
                  <button
                    type="button"
                    onClick={handleSaveVerification}
                    className="btn-save-indicator"
                  >
                    <CheckCircle size={15} aria-hidden="true" /> บันทึกการยืนยัน
                  </button>
                </div>
                {itemVerification && (
                  <p className="verified-timestamp">
                    ✓ ยืนยันแล้วเมื่อ {new Date(itemVerification.verifiedAt).toLocaleString('th-TH')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pretest-review-actions">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setIndex(currentIdx - 1)}
            >
              <ChevronLeft size={17} /> ข้อก่อนหน้า
            </button>
            <button
              type="button"
              disabled={currentIdx === questionsList.length - 1}
              onClick={() => setIndex(currentIdx + 1)}
            >
              ข้อถัดไป <ChevronRight size={17} />
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
