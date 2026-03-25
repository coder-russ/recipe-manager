import AddDropdown from './AddDropdown';

interface NavbarProps {
  onImportUrl: () => void;
  onManualCreate: () => void;
  onLogoClick: () => void;
}

export default function Navbar({ onImportUrl, onManualCreate, onLogoClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="font-serif text-xl font-bold text-text-primary hover:text-terracotta transition-colors cursor-pointer"
        >
          Recipe Manager
        </button>
        <AddDropdown onImportUrl={onImportUrl} onManualCreate={onManualCreate} />
      </div>
    </nav>
  );
}
