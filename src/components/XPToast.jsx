import UIIcon, { UIIconText } from './UIIcon';
export default function XPToast({ message }) {
  return (
    <div className="xp-toast">
      <UIIcon value={"✨"} /> <UIIconText value={message} />
    </div>
  );
}
