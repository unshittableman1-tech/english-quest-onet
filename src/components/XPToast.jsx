import UIIcon, { UIIconText } from './UIIcon';
export default function XPToast({ message }) {
  return (
    <div className="xp-toast" role="status" aria-live="polite" aria-atomic="true">
      <UIIcon value={"✨"} /> <UIIconText value={message} />
    </div>
  );
}
