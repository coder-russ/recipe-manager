interface NavbarProps {
  onAddRecipe: () => void;
  onLogoClick: () => void;
}

export default function Navbar({ onAddRecipe, onLogoClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onLogoClick}
          className="font-serif text-xl font-bold text-text-primary hover:text-terracotta transition-colors cursor-pointer"
        >
          Recipe Manager
        </button>
        <button
          onClick={onAddRecipe}
          className="bg-terracotta hover:bg-terracotta-dark text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer"
        >
          + Add Recipe
        </button>
      </div>
    </nav>
  );
}
