import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
  categories: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onChange,
  categories,
}) => {
  return (
    <ScrollArea className="w-full py-2">
      <div className="flex gap-2 pb-3 min-w-max">
        {["All", ...categories].map((category) => (
          <Button
            key={category}
            className={cn(
              "rounded-full px-3 py-1 text-sm",
              selectedCategory === category ? "bg-primary text-primary-foreground" : "border border-input bg-background text-white hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onChange(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
