import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  addon?: React.ReactNode;
  error?: string;
}

export function InputField({ label, name, error, placeholder, type = "text", required, addon, ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-end px-1">
        <label className="block text-[10px] font-medium text-muted-foreground tracking-[0.15em] uppercase">
          {label}
        </label>
      </div>
      <div className="relative group">
        <input
          name={name} type={type} placeholder={placeholder} required={required}
          className={cn(
            "w-full bg-secondary/30 border rounded-2xl text-foreground text-sm outline-none transition-all",
            "focus:ring-4 placeholder:text-muted-foreground/30",
            error 
              ? "border-destructive/40 focus:border-destructive/60 focus:ring-destructive/10" 
              : "border-white/5 focus:border-white/10 focus:ring-white/5",
            addon ? "py-3.5 pl-5 pr-12" : "py-3.5 px-5"
          )}
          {...props}
        />
        {addon && (
          <div className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
            error ? "text-destructive" : "text-muted-foreground group-focus-within:text-foreground"
          )}>
            {addon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-medium text-destructive/80 px-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}