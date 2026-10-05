// Minimal class joiner. Replaces the clsx + tailwind-merge helper the fancy components import.
export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ")
