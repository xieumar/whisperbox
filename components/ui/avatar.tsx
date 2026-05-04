export function Avatar({ name, size = 36 }: { name?: string; size?: number }) {
  const MONO_PALETTE = [
    "hsl(0 0% 15%)",
    "hsl(0 0% 20%)",
    "hsl(0 0% 10%)",
    "hsl(0 0% 25%)",
  ];
  const idx = name ? Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % MONO_PALETTE.length : 0;
  return (
    <div
      style={{ width: size, height: size, background: MONO_PALETTE[idx], fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-foreground/50 border border-white/5 font-bold shrink-0 select-none tracking-tighter"
    >
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}