import UIIcon, { UIIconText } from '../UIIcon';
export default function LandingAdventureSign() {
  const signs = [
    { text: 'LISTENING', icon: '🎧' },
    { text: 'READING', icon: '📖' },
    { text: 'GRAMMAR', icon: '📄' },
    { text: 'VOCABULARY', icon: '💡' },
  ];

  return (
    <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-[55%] hidden xl:flex flex-col items-center pointer-events-auto drop-shadow-2xl z-20">
      {/* Balloon on top */}
      <div className="mb-8 relative animate-float hover:scale-105 transition-transform cursor-pointer">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-orange-400 flex flex-col items-center justify-center text-white font-kanit font-black text-center shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)] border border-white/40 leading-tight">
          <span className="text-sm">DREAM</span>
          <span className="text-base text-yellow-200">LEARN</span>
          <span className="text-sm">ACHIEVE</span>
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-6 bg-amber-800 rounded-b-md"></div>
        {/* Ropes */}
        <div className="absolute -bottom-4 left-[30%] w-0.5 h-6 bg-amber-900/50 rotate-[20deg]"></div>
        <div className="absolute -bottom-4 right-[30%] w-0.5 h-6 bg-amber-900/50 -rotate-[20deg]"></div>
      </div>

      {/* Wooden pole */}
      <div className="w-5 h-[400px] bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-t-full shadow-[5px_0_15px_rgba(0,0,0,0.3)] absolute top-36 -z-10 border-x border-black/30"></div>

      {/* Signboards */}
      <div className="flex flex-col gap-5 mt-2 relative">
        {signs.map((sign, idx) => (
          <div 
            key={idx}
            className="group relative w-48 h-14 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-[0_8px_0_rgba(120,53,15,1),0_15px_20px_rgba(0,0,0,0.4)] border-2 border-amber-500/30 flex items-center px-4 cursor-pointer hover:translate-x-3 transition-transform duration-300"
            style={{
              transform: `rotate(${idx % 2 === 0 ? '-3deg' : '3deg'})`,
              marginLeft: idx % 2 === 0 ? '-12px' : '12px'
            }}
          >
            {/* Nails */}
            <div className="absolute left-3 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"></div>
            <div className="absolute right-3 w-2 h-2 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"></div>
            
            {/* Content */}
            <div className="flex items-center gap-3 w-full justify-center">
              <span className="text-2xl drop-shadow-md group-hover:scale-125 transition-transform"><UIIcon value={sign.icon} /></span>
              <span className="font-kanit font-black text-amber-50 tracking-wider text-base drop-shadow-md" style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.5)' }}>{sign.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
