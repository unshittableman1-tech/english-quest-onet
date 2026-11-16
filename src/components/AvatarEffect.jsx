import { getAvatarEffect } from '../data/avatarEffects';
import '../styles/avatarEffects.css';

export default function AvatarEffect({ id, animated=false }) {
  const effect=getAvatarEffect(id);
  if(!effect||effect.pattern==='none')return null;
  return <span className={`avatar-cosmetic-effect cosmetic-${effect.pattern}${animated?' is-animated':''}`} data-cosmetic-effect={id} data-effect-pattern={effect.pattern} aria-hidden="true">
    {effect.pattern==='constellation'
      ?<svg viewBox="0 0 100 100"><polyline points="7,61 14,83 35,94 64,89 91,68"/>{[[7,61],[14,83],[35,94],[64,89],[91,68]].map(([x,y])=><circle key={x} cx={x} cy={y} r="2.5"/>)}</svg>
      :Array.from({length:effect.pattern==='glow'?1:effect.pattern==='aura'?3:5},(_,index)=><span className="cosmetic-part" key={index} style={{'--i':index}}/>)}
  </span>;
}
