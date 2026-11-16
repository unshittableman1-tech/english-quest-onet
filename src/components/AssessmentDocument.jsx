import React, { useId } from 'react';
import { hasDocumentPresentation, stimulusDesign, stimulusTokens, assessmentVisualTreatment } from '../utils/assessmentStimulusDesign';
import PhysicalAssessmentDocument from './PhysicalAssessmentDocument';
import { physicalStimulusKind } from '../utils/physicalStimulusArtwork';

function Pictogram({ name }) {
  if (!name) return null;
  const paths = {
    quiet: <path d="M7 19h7l10-8v26l-10-8H7zM31 17q12 7 0 14" />,
    camera: <><path d="M9 17h9l3-5h10l3 5h6v20H9z" /><circle cx="25" cy="27" r="6" /><circle cx="24" cy="24" r="22" className="assessment-prohibition" /><path d="M9 40L39 8" className="assessment-prohibition" /></>,
    pedestrian: <><circle cx="25" cy="9" r="4" /><path d="m25 16-4 13-9 13m9-13 13 13m-9-24 10 8m-10-8-12 5" /></>,
    stairs: <path d="M5 39h12V27h12V15h12V7" />,
    leaf: <><path d="M24 40V17M24 29C8 29 7 16 10 10c14 0 17 10 14 19ZM24 23C37 23 42 12 38 7c-13 1-17 8-14 16Z" /></>,
    snow: <path d="M24 4v40M7 14l34 20M7 34l34-20M17 7l7 6 7-6M17 41l7-6 7 6" />,
  };
  return <svg className={`assessment-pictogram assessment-pictogram--${name}`} viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

// A semantic, reflowing view of the existing image's exact source text.
// Callers keep the original image available for zoom, print and media checks.
export default function AssessmentDocument({ art, onZoom, renderText = value => value }) {
  const titleId = useId();
  if (!hasDocumentPresentation(art)) return null;
  if (physicalStimulusKind(art)) return <PhysicalAssessmentDocument art={art} onZoom={onZoom} />;
  const design = stimulusDesign(art);
  const accent = stimulusTokens[design.tone];
  return <figure data-visual-treatment={assessmentVisualTreatment(art)} className={`assessment-document assessment-document--${design.family}`} style={{ '--assessment-accent': accent }} aria-labelledby={art.title ? titleId : undefined}>
    {art.title && <header className="assessment-document-heading">
      <Pictogram name={design.pictogram} />
      <h3 id={titleId}>{renderText(art.title)}</h3>
    </header>}
    {art.kind === 'process' ? <ol className="assessment-process-steps">{art.steps.map((step, index) => <li key={index}><span className="assessment-step-number" aria-hidden="true">{index + 1}</span><span>{renderText(step)}</span></li>)}</ol>
      : <div className="assessment-document-copy">{art.lines.map((line, index) => <p key={index}>{renderText(line)}</p>)}</div>}
    {onZoom && <button type="button" className="assessment-expand" onClick={onZoom}>ขยายสื่อประกอบ</button>}
  </figure>;
}
