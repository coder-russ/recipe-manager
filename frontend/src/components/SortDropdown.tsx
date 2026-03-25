interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'title', label: 'A-Z' },
  { value: 'cook_time', label: 'Cook time' },
  { value: 'rating', label: 'Highest rated' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta cursor-pointer"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
