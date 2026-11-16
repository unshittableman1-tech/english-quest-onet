import { getDynamicAvatarEffect } from '../data/avatarDynamicEffects';
import '../styles/avatarDynamicEffects.css';

export default function AvatarDynamicEffect({id,animated=true}) {
  const effect=getDynamicAvatarEffect(id);
  if(!effect)return null;
  return <span className={`avatar-dynamic-effect dynamic-${effect.pattern}${animated?' is-animated':''}`} aria-hidden="true">
    <span className="dynamic-halo" />
    {Array.from({length:7},(_,index)=><span className="dynamic-particle" key={index} style={{'--i':index}} />)}
  </span>;
}
