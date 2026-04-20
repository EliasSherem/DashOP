import { useState } from "react";
import { Menu, X } from "lucide-react";

interface Props {
  items: readonly string[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export const TopNav = ({ items, activeIndex, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-[hsl(215_50%_18%)] border-b border-[hsl(215_40%_28%)] sticky top-0 z-40">
      <div className="px-4 md:px-6 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide text-foreground/90 py-3 md:hidden">
          CSC Dashboard
        </span>

        {/* Desktop / tablet */}
        <ul className="hidden md:flex flex-1 items-stretch overflow-x-auto">
          {items.map((label, i) => {
            const active = i === activeIndex;
            return (
              <li key={label} className="flex">
                <button
                  onClick={() => onSelect(i)}
                  className={`px-3 lg:px-5 py-3 text-xs lg:text-sm font-medium whitespace-nowrap transition border-b-2 ${
                    active
                      ? "text-foreground border-primary bg-[hsl(215_50%_22%)]"
                      : "text-foreground/65 border-transparent hover:text-foreground hover:bg-[hsl(215_50%_22%)]"
                  }`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-9 w-9 grid place-items-center rounded-md text-foreground/80 hover:bg-[hsl(215_50%_22%)]"
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul className="md:hidden border-t border-[hsl(215_40%_28%)]">
          {items.map((label, i) => {
            const active = i === activeIndex;
            return (
              <li key={label}>
                <button
                  onClick={() => {
                    onSelect(i);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition ${
                    active
                      ? "text-foreground bg-[hsl(215_50%_22%)] border-l-4 border-primary"
                      : "text-foreground/70 border-l-4 border-transparent hover:bg-[hsl(215_50%_22%)]"
                  }`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};
