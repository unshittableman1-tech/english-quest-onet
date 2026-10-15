import {
  Map, Brain, Award, Trophy, ChartColumn, Star, Crown, Zap, Flame, Gem, Circle, Percent, Hourglass, ThumbsUp, ThumbsDown,
  LockKeyhole, BookOpen, GraduationCap, Users, School, House, UserRound,
  ClipboardList, Target, Lightbulb, CircleCheck, CircleX, TriangleAlert,
  RotateCcw, Gamepad2, Layers, Link, Pencil, MessageCircle, Hand,
  AudioLines, Volume2, VolumeX, Music2, Mic, Headphones, Sparkles,
  Gift, CalendarDays, Clock, Flag, Rocket, ShieldCheck, Swords,
  Utensils, HeartPulse, CloudSun, Shapes, Shirt, ShoppingCart, Briefcase,
  Compass, Search, KeyRound, Bot, Globe, Languages, Settings, LogOut,
  Moon, Sun, Printer, FileText, Trash2, Save, Download, Upload, Mail,
  Phone, Camera, Image, Check, X, ArrowLeft, ArrowRight, Footprints,
  Smile, Coffee, Apple, Calculator, Palette, CircleHelp, RefreshCw,
  Backpack, Smartphone, Castle, Siren, ScrollText, Wrench, Plus, Eye, CarFront, TrafficCone, Leaf, GlassWater,
} from 'lucide-react';

const ICONS = {
  '🗺': Map, '🧠': Brain, '🏅': Award, '🎖': Award, '🏆': Trophy,
  '📊': ChartColumn, '📈': ChartColumn, '📉': ChartColumn,
  '⭐': Star, '🌟': Star, '☆': Star, '👑': Crown, '⚡': Zap,
  '🔥': Flame, '💎': Gem, '🔒': LockKeyhole, '🔓': LockKeyhole,
  '📖': BookOpen, '📚': BookOpen, '📘': BookOpen, '📗': BookOpen,
  '📙': BookOpen, '📕': BookOpen, '🎓': GraduationCap,
  '👥': Users, '👨‍👩‍👧‍👦': Users, '👨‍👩‍👧': Users,
  '🏫': School, '🏠': House, '🏡': House, '👶': UserRound,
  '👤': UserRound, '👩‍🏫': GraduationCap, '👨‍🏫': GraduationCap,
  '📝': ClipboardList, '📋': ClipboardList, '🎯': Target,
  '💡': Lightbulb, '✅': CircleCheck, '☑': CircleCheck,
  '❌': CircleX, '⚠': TriangleAlert, '🚧': TriangleAlert,
  '🔄': RotateCcw, '🔁': RefreshCw, '🎮': Gamepad2, '🃏': Layers,
  '🔗': Link, '✏': Pencil, '💬': MessageCircle, '👆': Hand,
  '📦': Layers, '🔤': Languages, '🔠': Languages, '🔢': Calculator,
  '🔊': Volume2, '🔉': Volume2, '🔈': Volume2, '🔇': VolumeX,
  '🎵': Music2, '🎶': Music2, '🎤': Mic, '🎧': Headphones,
  '✨': Sparkles, '🎉': Sparkles, '🎊': Sparkles, '🎁': Gift,
  '📅': CalendarDays, '📆': CalendarDays, '⏰': Clock, '⏱': Clock,
  '🏁': Flag, '🚩': Flag, '🚀': Rocket, '🛡': ShieldCheck,
  '⚔': Swords, '💪': Zap, '🍜': Utensils, '🍽': Utensils,
  '🏥': HeartPulse, '💊': HeartPulse, '🌤': CloudSun, '☀': Sun,
  '🌙': Moon, '💤': Moon, '🎨': Palette, '👕': Shirt,
  '🛒': ShoppingCart, '💼': Briefcase, '🧭': Compass, '🔍': Search,
  '🔎': Search, '🔑': KeyRound, '🤖': Bot, '🌍': Globe, '🌐': Globe,
  '⚙': Settings, '🚪': LogOut, '🖨': Printer, '📄': FileText,
  '🗑': Trash2, '💾': Save, '📥': Download, '📤': Upload,
  '📧': Mail, '✉': Mail, '📞': Phone, '📷': Camera, '🖼': Image,
  '✔': Check, '✓': Check, '✕': X, '✖': X, '⬅': ArrowLeft,
  '➡': ArrowRight, '←': ArrowLeft, '→': ArrowRight, '👣': Footprints, '😊': Smile, '🙂': Smile,
  '☕': Coffee, '🍎': Apple, '📌': Flag, '📍': Compass,
  '🧩': Shapes, '🔺': Shapes, '🔷': Shapes, '❓': CircleHelp,
  '👋': Hand, '👇': Hand, '👍': ThumbsUp, '👎': ThumbsDown,
  '🟢': Circle, '🔴': Circle, '🔵': Circle, '🟡': Circle, '💯': Percent,
  '⏳': Hourglass, '⌛': Hourglass, '🕵️‍♂️': Search,
  '🎒': Backpack, '📱': Smartphone, '🏃': Footprints, '🐉': Swords,
  '🏰': Castle, '💥': Zap, '🚨': Siren, '📜': ScrollText,
  '🛠': Wrench, '🤔': CircleHelp, '👉': Hand, '➕': Plus,
  '👁': Eye, '🕒': Clock,
  '🚗': CarFront, '🚦': TrafficCone, '👷': Briefcase, '👔': Shirt, '🌿': Leaf, '🥛': GlassWater,
  '🏟': Trophy, '🎲': Gamepad2, '💖': HeartPulse, '❤️': HeartPulse,
};
const normalizedIcons = Object.fromEntries(Object.entries(ICONS).map(([key, icon]) => [key.replace(/[\uFE0E\uFE0F]/g, ''), icon]));

// Legacy icon data stays unchanged; only its UI presentation uses Lucide.
export default function UIIcon({ value, label, className = '', size = '1em' }) {
  const key = String(value || '').replace(/[\uFE0E\uFE0F]/g, '');
  const Icon = normalizedIcons[key] || Sparkles;
  return <Icon size={size} strokeWidth={1.8} className={`ui-outline-icon ${className}`}
    style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }}
    aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} />;
}

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
export function UIIconText({ value }) {
  if (typeof value !== 'string') return value;
  return [...segmenter.segment(value)].map(({ segment, index }) =>
    /\p{Extended_Pictographic}|[✓☆✕✖←→]/u.test(segment)
      ? <UIIcon key={index} value={segment} /> : segment);
}
