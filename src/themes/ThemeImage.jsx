import {useState} from 'react';
import {useTheme} from './ThemeProvider';
export default function ThemeImage({assetKey,classicSrc,...props}){
 const {theme,asset}=useTheme();const preferred=theme.key==='classic'?classicSrc:(asset(assetKey)||classicSrc);
 const [failed,setFailed]=useState(null);
 return <img {...props} src={failed===preferred?classicSrc:preferred} onError={()=>{if(preferred!==classicSrc)setFailed(preferred);}}/>;
}
