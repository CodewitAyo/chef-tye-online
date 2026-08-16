import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

/**
 * Replaces the native <input type="datetime-local"> (CT-ADMIN-003) with a
 * styled calendar popover + time field, built from the app's existing
 * shadcn Calendar/Popover primitives. Emits the same "yyyy-MM-ddTHH:mm"
 * local-datetime string the rest of the admin form already expects, so no
 * changes were needed upstream in submitOrder's new Date(...) parsing.
 */
export function OrderDateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const parsed = value ? parse(value, LOCAL_FORMAT, new Date()) : undefined;
  const selectedDate = parsed && isValid(parsed) ? parsed : undefined;
  const timeValue = selectedDate ? format(selectedDate, "HH:mm") : "";

  function commit(date: Date | undefined, time: string) {
    if (!date) {
      onChange("");
      return;
    }
    const [h, m] = (time || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
    const next = new Date(date);
    next.setHours(h, m, 0, 0);
    onChange(format(next, LOCAL_FORMAT));
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-auto flex-1 justify-start rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-normal hover:bg-background",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-brand" />
            {selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            captionLayout="dropdown"
            onSelect={(date) => {
              commit(date, timeValue);
              if (date) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <label className="relative flex shrink-0 items-center">
        <Clock className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="time"
          value={timeValue}
          onChange={(e) => commit(selectedDate ?? new Date(), e.target.value)}
          className="w-[128px] rounded-xl border-2 border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground [color-scheme:light] dark:[color-scheme:dark]"
        />
      </label>
    </div>
  );
}
