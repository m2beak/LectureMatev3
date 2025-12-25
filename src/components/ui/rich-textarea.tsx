import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "@/components/ui/textarea";

interface RichTextareaProps extends TextareaProps {
  onTextSelect?: (text: string) => void;
}

export const RichTextarea = ({
  className,
  onTextSelect,
  ...props
}: RichTextareaProps) => {
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      onTextSelect?.(selection.toString().trim());
    }
  };

  return (
    <Textarea
      className={cn(
        "min-h-[300px] font-mono text-sm leading-relaxed resize-none",
        className
      )}
      onMouseUp={handleMouseUp}
      {...props}
    />
  );
};
