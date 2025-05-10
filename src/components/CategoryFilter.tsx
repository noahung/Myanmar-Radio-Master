
import React from 'react';
import { categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onChange,
}) => {
  return (
    <ScrollArea className="w-full py-2">
      <div className="flex gap-2 pb-3 min-w-max">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={cn(
              "rounded-full",
              selectedCategory === category && "bg-primary text-primary-foreground"
            )}
            onClick={() => onChange(category)}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
