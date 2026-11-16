import React,{useEffect,useRef,useState} from 'react';
import {physicalStimulusKind,renderPhysicalStimulus} from '../utils/physicalStimulusArtwork';

export default function PhysicalAssessmentDocument({art,onZoom}){
 const host=useRef(null),[width,setWidth]=useState(620);
 useEffect(()=>{
  const element=host.current;
  const measure=()=>setWidth(Math.max(220,Math.round(element.getBoundingClientRect().width)));
  measure();
  if(typeof ResizeObserver==='undefined'){window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);}
  const observer=new ResizeObserver(measure);observer.observe(element);
  return()=>observer.disconnect();
 },[]);
 return <figure data-visual-treatment="evidence-2d" className={`assessment-document assessment-physical assessment-physical--${physicalStimulusKind(art)}`}>
  <div ref={host} dangerouslySetInnerHTML={{__html:renderPhysicalStimulus(art,width)}} />
  {onZoom&&<button className="assessment-expand" type="button" onClick={onZoom}>ขยายสื่อประกอบ</button>}
 </figure>;
}
