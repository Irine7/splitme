'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, CreditCard, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupModal } from '@/components/modals/create-group-modal';

// Define expense categories with icons and colors
const EXPENSE_CATEGORIES = [
  { id: 'bars', name: 'Bars', icon: '🍔', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'other', name: 'Other', icon: '📝', color: 'bg-gray-100 dark:bg-gray-800/50' },
];

interface GroupCarouselProps {
  onSelectGroup?: (groupId: number) => void;
}

export function GroupCarousel({ onSelectGroup }: GroupCarouselProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // State for carousel scrolling
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAmount = 300; // Pixels to scroll each time
  
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('group-carousel-container');
    if (!container) return;
    
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
      
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const handleCreateGroup = (category: string) => {
    setSelectedCategory(category);
    setShowCreateGroup(true);
  };

  return (
    <div className="relative">
      {/* Carousel Navigation Buttons */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => handleScroll('left')}
          disabled={scrollPosition <= 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Carousel Container */}
      <div 
        id="group-carousel-container"
        className="flex overflow-x-auto carousel-scroll gap-4 py-4 px-2 snap-x"
      >
        {/* Create New Group Card */}
        {/* <div className="min-w-[280px] w-[280px] snap-start">
          <div className="glass-card carousel-card h-[220px] p-6 flex flex-col items-center justify-center text-center cursor-pointer"
               onClick={() => setShowCreateGroup(true)}>
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              Создать новую группу
            </h3>
            <p className="text-sm text-foreground/70">
              Разделите расходы с друзьями или коллегами
            </p>
          </div>
        </div> */}
        
        {/* Category Cards */}
        {EXPENSE_CATEGORIES.map((category) => (
          <div key={category.id} className="min-w-[280px] w-[280px] snap-start">
            <div 
              className={`glass-card carousel-card category-card h-[220px] p-6 flex flex-col items-center justify-center text-center cursor-pointer ${category.color}`}
              onClick={() => handleCreateGroup(category.id)}
            >
              <div className="text-4xl mb-4 category-icon">{category.icon}</div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-foreground/70">
                Create a split for this expense category
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          initialCategory={selectedCategory}
        />
      )}
    </div>
  );
}
