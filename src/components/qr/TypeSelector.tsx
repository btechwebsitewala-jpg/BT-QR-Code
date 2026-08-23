import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QR_TYPES, type QRTypeId } from "@/lib/qr/config";
import { cn } from "@/lib/utils";

const VISIBLE = 8;

interface TypeSelectorProps {
  value: QRTypeId;
  onChange: (id: QRTypeId) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const [expanded, setExpanded] = useState(false);
  const types = expanded ? QR_TYPES : QR_TYPES.slice(0, VISIBLE);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {types.map((type) => {
          const Icon = type.icon;
          const active = type.id === value;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              aria-pressed={active}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all",
                active
                  ? "border-primary bg-primary/5 shadow-brand"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-colors",
                  active
                    ? "bg-brand-gradient text-primary-foreground"
                    : "bg-secondary text-primary group-hover:bg-primary/10",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-xs font-semibold leading-tight">{type.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? (
            <>
              Show less <ChevronUp className="ml-1 size-4" />
            </>
          ) : (
            <>
              View all {QR_TYPES.length} types <ChevronDown className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
