import { PALETTE } from "@/lib/utils";

export function Avatar({ name, size = 36 }: { name?: string; size?: number }) {
  const idx = name ? Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % PALETTE.length : 0;
  return (
    <div
      style={{ width: size, height: size, background: PALETTE[idx], fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none tracking-tighter"
    >
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}