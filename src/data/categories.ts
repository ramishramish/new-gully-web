import { CategoryInfo, MensSubCategory, KidsSubCategory } from '../types';

export interface SubCategoryFilter {
  id: MensSubCategory | KidsSubCategory;
  name: string;
  iconName?: string;
  count?: number;
}

export const MENS_SUBCATEGORIES: SubCategoryFilter[] = [
  { id: 'shirts', name: 'Shirts' },
  { id: 't-shirts', name: 'T-Shirts' },
  { id: 'jeans', name: 'Jeans' },
  { id: 'trousers', name: 'Trousers' },
  { id: 'casual-wear', name: 'Casual Wear' },
  { id: 'formal-wear', name: 'Formal Wear' },
  { id: 'traditional-wear', name: 'Traditional Wear' }
];

export const KIDS_SUBCATEGORIES: SubCategoryFilter[] = [
  { id: 'boys-shirts', name: "Boys' Shirts" },
  { id: 'kids-t-shirts', name: "Kids' T-Shirts" },
  { id: 'pants-shorts', name: "Pants & Shorts" },
  { id: 'casual-wear', name: "Casual Wear" },
  { id: 'party-wear', name: "Party & Occasion Wear" }
];

export const FEATURED_MAIN_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-mens',
    name: "MEN'S COLLECTION",
    slug: 'mens',
    category: 'men',
    description: "From tailored formal shirts and everyday linen to comfort trousers and classic denim, crafted for the modern gentleman.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=85",
    itemCount: 16
  },
  {
    id: 'cat-kids',
    name: "KIDS' COLLECTION",
    slug: 'kids',
    category: 'kids',
    description: "Soft, breathable, and cheerful styles for boys and young explorers. Built durable for play, tailored smart for celebrations.",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=85",
    itemCount: 12
  }
];
