import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({ className, date, onDateChange }: DatePickerWithRangeProps) {
  const handleDateChange = (range: DateRange | undefined) => {
    onDateChange(range);
  };

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-range"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal text-xs sm:text-sm",
              !date?.from && !date?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={1}
            className="text-xs sm:text-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}