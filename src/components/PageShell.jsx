import logo from '../assets/logo.png';
import ThemeImage from '../themes/ThemeImage';

export default function PageShell({ children, right, veil = 0, className = '' }) {
  return (
    <div className={`eq-shell ${className}`} style={{ '--eq-veil': veil }}>
      <div className="eq-shell-bg" aria-hidden="true" />
      <header className="eq-header" aria-label="เมนูหลัก">
        <a className="eq-header-brand" href="#top" aria-label="English Quest AI">
          <ThemeImage assetKey="logo" classicSrc={logo} alt="English Quest AI / ONEX" />
        </a>
        <a className="eq-header-home" href="#top">หน้าหลัก</a>
        <div className="eq-header-right">{right}</div>
      </header>
      <main id="top" className="eq-shell-content">{children}</main>
    </div>
  );
}
