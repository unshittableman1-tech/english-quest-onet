export type ThemeKey = 'classic' | 'onex_fantasy';
export interface ThemeDefinition {
 key: ThemeKey; name: string; description: string;
 tokens: { primary:string; accent:string; surface:string; text:string; border:string; glow:string };
 assets: Partial<Record<'logo'|'compactLogo'|'emblem'|'quest'|'vocab'|'exam'|'progress'|'background'|'mascot',string|null>>;
}
export interface ThemeSettings {
 version:1; activeTheme:ThemeKey; defaultTheme:ThemeKey; enabled:ThemeKey[];
 history:Array<{id:string;at:string;actorId:string;action:string;from:ThemeKey;to:ThemeKey}>;
}
