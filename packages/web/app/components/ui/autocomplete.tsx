import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";

// lib
import { cn } from "~/lib/utils";

// internals
import { CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Skeleton } from "./skeleton";

export type Option = {
  value: string;
  label: string;
  poster: string | null;
};

type AutoCompleteProps = {
  options: Option[];
  emptyMessage: string;
  selectedValue?: Option;
  onValueChange?: (value: Option) => void;
  onInputChange?: (inputValue: string) => void;
  inputValue?: string;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export const AutoComplete = ({
  options,
  placeholder,
  emptyMessage,
  selectedValue,
  onValueChange,
  onInputChange,
  inputValue,
  disabled,
  isLoading = false,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(selectedValue as Option);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find((option) => option.label === input.value);
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, options, onValueChange],
  );

  const handleBlur = useCallback(() => {
    console.log("\n ~ handleBlur ~ selected:", selected);
    setOpen(false);
    onInputChange?.(selected?.label);
  }, [selected, onInputChange]);

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      console.log("\n ~ selectedOption:", selectedOption);
      onInputChange?.(selectedOption.label);

      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [onValueChange, onInputChange],
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div className=" border border-zinc-800 rounded-md bg-stone-950">
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : onInputChange}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-sm"
        />
      </div>
      <div className="relative mt-1">
        <div
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-md bg-zinc-950 outline-none",
            isOpen ? "block" : "hidden",
          )}
        >
          <CommandList className="rounded-md border border-zinc-800">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full bg-zinc-800" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected?.value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn("flex w-full items-center gap-2", !isSelected ? "pl-8" : null)}
                    >
                      {isSelected ? <Check className="w-4 " /> : null}
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm text-zinc-50">
                {emptyMessage}
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  );
};
