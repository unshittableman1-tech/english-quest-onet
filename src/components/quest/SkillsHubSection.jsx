import { useState } from 'react';
import { Lightbulb, BookOpen, RotateCcw, ArrowRight, Sparkles, CheckCircle2, Zap, Swords, Compass, Volume2 } from 'lucide-react';
import { ALL_TECHNIQUES } from '../TechniqueHub';
import { VOCAB_CATEGORIES } from '../../data/vocabDrill';
import { readVocabPractice } from '../../utils/vocabPractice';
import { getPendingQuestReviews } from '../../utils/questReviewGate';
import SpeakButton from '../SpeakButton';
import ResilientArtwork from '../ResilientArtwork';
import '../../styles/skillsHub.css';

export default function SkillsHubSection({ student, onNavigate }) {
  const [selectedTechIdx, setSelectedTechIdx] = useState(0);

  const vocabHistory = readVocabPractice(student?.isDemo ? null : student?.id);
  const practicedCategoriesCount = Object.keys(vocabHistory?.categories || {}).length;
  const vocabSessions = Object.values(vocabHistory?.categories || {}).reduce((sum, item) => sum + (item.sessions || 0), 0);

  const pendingReviews = getPendingQuestReviews(student);
  const totalMistakes = pendingReviews.reduce((sum, item) => sum + (item.count || 0), 0);

  const currentTech = ALL_TECHNIQUES[selectedTechIdx] || ALL_TECHNIQUES[0];

  return (
    <div className="skills-hub-container" aria-label="ศูนย์รวมเทคนิคและคลังคำศัพท์">
      {/* ── 1. Hero Introduction ───────────────────────────── */}
      <section className="skills-hub-hero">
        <div className="skills-hub-hero-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>O-NET Content Intelligence</span>
        </div>
        <h2>ศูนย์เทคนิค &amp; <span>คลังคำศัพท์ O-NET</span></h2>
        <p>
          2 เสาหลักความรู้สำคัญก่อนลงสนามจริง: เรียนรู้เทคนิคตัดช้อยส์ สูตรลัดโครงสร้างประโยค
          และฝึกท่องศัพท์แม่นยำผ่าน 6 มินิเกม
        </p>

        {/* Quick KPI stats */}
        <div className="skills-hub-metrics">
          <div className="skills-metric-card">
            <span className="skills-metric-icon tech"><Lightbulb size={20} /></span>
            <div>
              <strong>{ALL_TECHNIQUES.length} หมวดสูตรลัด</strong>
              <span>ครอบคลุม 13 ตัวชี้วัด O-NET</span>
            </div>
          </div>
          <div className="skills-metric-card">
            <span className="skills-metric-icon vocab"><BookOpen size={20} /></span>
            <div>
              <strong>{practicedCategoriesCount}/{VOCAB_CATEGORIES.length} หมวดศัพท์</strong>
              <span>ฝึกสะสม {vocabSessions} รอบ</span>
            </div>
          </div>
          <div className="skills-metric-card">
            <span className="skills-metric-icon mistake"><RotateCcw size={20} /></span>
            <div>
              <strong>{totalMistakes > 0 ? `${totalMistakes} ข้อรอซ่อม` : 'ไม่มีข้อผิดค้าง'}</strong>
              <span>Error Bank พร้อมลุย</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Two Master Pillars Grid ──────────────────────── */}
      <div className="skills-hub-grid">
        {/* PILLAR A: Technique Hub */}
        <article className="skills-card tech-card">
          <div className="skills-card-header">
            <div className="skills-card-icon tech">
              <Lightbulb size={28} />
            </div>
            <div>
              <span className="skills-card-tag tech">เสาหลักที่ 1 · เรียนเทคนิค (ครบ {ALL_TECHNIQUES.length} หมวด 13 ตัวชี้วัด)</span>
              <h3>Technique Hub (สูตรลัด &amp; ตัดช้อยส์)</h3>
            </div>
          </div>

          <p className="skills-card-desc">
            สรุปหัวใจสำคัญของข้อสอบภาษาอังกฤษ ป.6 ครบ 13 ตัวชี้วัด เคล็ดลับการตัดตัวเลือกหลอก เทคนิคบทสนทนา ป้ายสัญลักษณ์ แผนที่ กราฟ และวัฒนธรรม
          </p>

          {/* Part Selection Pills */}
          <div className="skills-parts-selector" role="tablist" aria-label="เลือกดูตัวอย่างเทคนิค">
            {ALL_TECHNIQUES.map((tech, idx) => (
              <button
                key={tech.id}
                type="button"
                className={`skills-part-pill ${idx === selectedTechIdx ? 'active' : ''}`}
                onClick={() => setSelectedTechIdx(idx)}
                title={tech.title}
              >
                <span>{tech.part}</span>
              </button>
            ))}
          </div>

          {/* Quick Preview Box of the selected technique */}
          <div className="skills-preview-box">
            <div className="skills-preview-title">
              <span className="skills-preview-tag">{currentTech.part}</span>
              <h4>{currentTech.title}</h4>
            </div>
            <p className="skills-preview-desc">{currentTech.description}</p>
            
            {/* Rules Header with count */}
            <div className="skills-rules-header">
              <span className="skills-rules-count-badge">
                💡 สรุปหัวใจสำคัญ (ครบทั้ง {currentTech.rules?.length || 0} สูตรในหมวดนี้)
              </span>
              <div className="skills-header-actions">
                <button
                  type="button"
                  className="skills-enter-pill-btn"
                  onClick={() => onNavigate('technique-practice', currentTech.id)}
                  title={`เข้าสู่สนามฝึกทำโจทย์ ${currentTech.part} ทันที`}
                >
                  <span>🎯 เข้าฝึกโจทย์</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  className="skills-fullscreen-btn"
                  onClick={() => onNavigate('technique-hub', currentTech.id)}
                  title="เปิดสูตรลัดหมวดนี้แบบเต็มจอ"
                >
                  <span>เต็มจอ</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Complete Rules Showcase List */}
            {currentTech.rules && currentTech.rules.length > 0 && (
              <div className="skills-sample-rule-list" role="list" aria-label={`สูตรสำคัญหมวด ${currentTech.part}`}>
                {currentTech.rules.map((rule, rIdx) => (
                  <div key={rIdx} className="skills-sample-rule" role="listitem">
                    <div className="sample-q-header">
                      <span className="sample-rule-num">#{rIdx + 1}</span>
                      <div className="sample-q-body">
                        <div className="sample-q-main">
                          <strong>{rule.q}</strong>
                          {/[a-zA-Z]/.test(rule.q) && (
                            <SpeakButton text={rule.q} className="sample-speak-btn" label={`ฟังเสียง ${rule.q}`} />
                          )}
                        </div>
                        {rule.qTh && (
                          <div className="sample-trans">
                            <span className="sample-trans-tag">แปล</span>
                            <span>{rule.qTh}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sample-a">
                      <span className="sample-a-icon">👉</span>
                      <div className="sample-a-body">
                        <div className="sample-a-text">{rule.a}</div>
                        {rule.aTh && (
                          <div className="sample-a-sub">
                            <span className="sample-sub-tag">ตัวอย่าง/คำแปล:</span> {rule.aTh}
                          </div>
                        )}
                      </div>
                    </div>

                    {rule.note && (
                      <div className="sample-note">
                        <Zap size={13} className="shrink-0" />
                        <span>{rule.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card Action Foot */}
          <div className="skills-card-footer">
            <button
              type="button"
              className="skills-primary-btn tech"
              onClick={() => onNavigate('technique-practice', currentTech.id)}
            >
              <span>🚀 เข้าฝึกทำโจทย์ {currentTech.part} ทันที</span>
              <ArrowRight size={18} />
            </button>

            <div className="skills-sub-actions">
              <button
                type="button"
                className="skills-sub-btn"
                onClick={() => onNavigate('technique-hub', currentTech.id)}
                title="เปิดอ่านสูตรและเคล็ดลับแบบเต็มหน้าจอ"
              >
                <span>📖 เข้าดูสูตรลัดเต็มจอ</span>
              </button>
              <button
                type="button"
                className="skills-sub-btn indicator"
                onClick={() => onNavigate('indicator-bank', selectedTechIdx + 1)}
                title="เข้าทำแนวข้อสอบ 13 ตัวชี้วัด สทศ."
              >
                <span>📝 คลังข้อสอบชุดที่ {selectedTechIdx + 1} (20 ข้อ)</span>
              </button>
            </div>
          </div>
        </article>

        {/* PILLAR B: Vocab Drill */}
        <article className="skills-card vocab-card">
          <div className="skills-card-header">
            <div className="skills-card-icon vocab">
              <BookOpen size={28} />
            </div>
            <div>
              <span className="skills-card-tag vocab">เสาหลักที่ 2 · ฝึกคำสำคัญ ({VOCAB_CATEGORIES.length} หมวด)</span>
              <h3>Vocab Drill (คลังคำศัพท์ {VOCAB_CATEGORIES.length} หมวด)</h3>
            </div>
          </div>

          <p className="skills-card-desc">
            คำศัพท์ออกสอบบ่อย ป.6 คัดสรรตามมาตรฐาน สทศ. ท่องจำและฝึกซ้ำผ่านมินิเกม 6 รูปแบบเพื่อความจำระยะยาว
          </p>

          {/* Mini-Games Showcase */}
          <div className="skills-modes-showcase">
            <span className="mode-pill">🃏 Flashcard</span>
            <span className="mode-pill">⚡ Speed Rush</span>
            <span className="mode-pill">⚔️ Vocab Duel</span>
            <span className="mode-pill">🧩 Fill in the Blank</span>
            <span className="mode-pill">🧠 Memory Match</span>
            <span className="mode-pill">🗣️ Voice Speak</span>
          </div>

          {/* Categories Grid Preview */}
          <div className="skills-vocab-categories">
            <div className="skills-vocab-header">
              <span>หมวดคำศัพท์ยอดนิยม ({practicedCategoriesCount}/{VOCAB_CATEGORIES.length} หมวดที่ฝึกแล้ว)</span>
            </div>
            <div className="skills-categories-grid">
              {VOCAB_CATEGORIES.slice(0, 12).map(cat => (
                <div key={cat.id} className="skills-cat-item">
                  <span className="skills-cat-icon">{cat.icon || '📖'}</span>
                  <span className="skills-cat-name">{cat.name.split(' (')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Action Foot */}
          <div className="skills-card-footer">
            <button
              type="button"
              className="skills-primary-btn vocab"
              onClick={() => onNavigate('vocab-drill')}
            >
              <span>เข้าสู่ Vocab Adventure (ฝึกคำศัพท์)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </article>
      </div>

      {/* ── 3. Error Bank + Explain My Mistake ───────────────── */}
      <section className="skills-error-bank">
        <div className="skills-error-content">
          <div className="skills-error-icon">
            <RotateCcw size={32} />
          </div>
          <div className="skills-error-info">
            <div className="skills-error-tag-row">
              <span className="skills-error-tag">Error Bank &amp; Remediation</span>
              {totalMistakes > 0 && <span className="skills-mistake-count">{totalMistakes} ข้อที่ต้องซ่อม</span>}
            </div>
            <h4>สมุดวิเคราะห์ข้อผิดพลาด (Explain My Mistake)</h4>
            <p>
              {totalMistakes > 0
                ? `คุณมีข้อที่ยังตอบไม่ถูกต้องสะสมอยู่ ${totalMistakes} ข้อ ระบบแนะนำให้ทบทวนข้อผิดให้เข้าใจก่อนลงสนามสอบจริง!`
                : 'ยอดเยี่ยมมาก! ไม่มีข้อผิดค้างอยู่ในระบบ คุณพร้อมสำหรับการประเมินผลในสนามสอบแล้ว'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={`skills-error-action ${totalMistakes > 0 ? 'highlight' : ''}`}
          onClick={() => onNavigate('review')}
        >
          <span>{totalMistakes > 0 ? 'ทบทวนข้อผิดทันที' : 'ดูสมุดจดบันทึกข้อผิด'}</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
