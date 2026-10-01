import { useEffect } from "react";

export default function useLearningKeyboard({
  onPrevious,
  onNext,
  disabled = false,
}) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious?.();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrevious, onNext, disabled]);
}