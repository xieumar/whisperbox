import { cn } from "@/lib/utils";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  addon?: React.ReactNode;
}

export function InputField({ label, name, placeholder, type = "text", required, addon, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 mb-1 tracking-wider uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          name={name} type={type} placeholder={placeholder} required={required}
          className={cn(
            "w-full bg-[#09111e] border border-[#0f2040] rounded-xl text-[#dde8f5] text-sm outline-none transition-all",
            "focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-600",
            addon ? "py-2.5 pl-3.5 pr-10" : "py-2.5 px-3.5"
          )}
          {...props}
        />
        {addon && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            {addon}
          </div>
        )}
      </div>
    </div>
  );
}