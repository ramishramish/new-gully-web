import { Product } from '../types';

export const ALL_PRODUCTS: Product[] = [
  // =========================================================================
  // MEN'S CLOTHING COLLECTION
  // =========================================================================
  {
    id: 'men-1',
    name: "Classic Oxford Cotton Shirt",
    price: 799,
    originalPrice: 999,
    discountPercentage: 20,
    category: 'men',
    subCategory: 'shirts',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Crisp and durable oxford cotton shirt with button-down collar. Tailored for comfort in tropical Kerala weather, effortlessly versatile for casual and office wear.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Vintage Olive', hex: '#4D5D46' },
      { name: 'Warm Cream', hex: '#FAF5EC' },
      { name: 'Sky Chambray', hex: '#7BA4C7' }
    ],
    inStock: true,
    stockCount: 14,
    fabric: '100% Breathable Combed Cotton',
    fit: 'Regular Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 38
  },
  {
    id: 'men-2',
    name: "Men's Luxury Formal Shirt",
    price: 999,
    originalPrice: 1299,
    discountPercentage: 23,
    category: 'men',
    subCategory: 'shirts',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15c429f66bf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Premium formal dress shirt crafted with a structured semi-spread collar and mother-of-pearl style buttons. Wrinkle-resistant finish for professional sharpness.',
    sizes: ['38', '40', '42', '44'],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Powder Blue', hex: '#C2D6E8' },
      { name: 'Soft Charcoal', hex: '#3B3B3B' }
    ],
    inStock: true,
    stockCount: 8,
    fabric: 'Egyptian Cotton Blend',
    fit: 'Slim Formal Fit',
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 42
  },
  {
    id: 'men-3',
    name: "Men's Casual Crewneck T-Shirt",
    price: 499,
    originalPrice: 649,
    discountPercentage: 23,
    category: 'men',
    subCategory: 't-shirts',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Ultra-soft heavy gauge combed cotton tee with reinforced ribbed neck. Designed to hold shape through countless washes with a vintage lived-in feel.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Burgundy Rust', hex: '#731C28' },
      { name: 'Vintage Black', hex: '#1C1917' },
      { name: 'Heather Sand', hex: '#D7CEBE' }
    ],
    inStock: true,
    stockCount: 22,
    fabric: '220 GSM Bio-Washed Cotton',
    fit: 'Classic Relaxed Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 56
  },
  {
    id: 'men-4',
    name: "Slim Fit Stretch Denim Jeans",
    price: 1199,
    originalPrice: 1599,
    discountPercentage: 25,
    category: 'men',
    subCategory: 'jeans',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Authentic 12oz stretch denim with vintage whiskering and brass rivets. Built with gentle flex for all-day freedom whether on the bike or dining out.',
    sizes: ['30', '32', '34', '36', '38'],
    colors: [
      { name: 'Dark Indigo Wash', hex: '#1C2E4A' },
      { name: 'Vintage Stone Wash', hex: '#466488' }
    ],
    inStock: true,
    stockCount: 16,
    fabric: '98% Cotton, 2% Elastane',
    fit: 'Slim Tapered Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 65
  },
  {
    id: 'men-5',
    name: "Men's Formal Pleated Trousers",
    price: 999,
    originalPrice: 1299,
    discountPercentage: 23,
    category: 'men',
    subCategory: 'trousers',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Tailored drape trousers with flat front or single pleat styling. Features an expandable waistband lining for unmatched comfort during long celebrations.',
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Dark Charcoal', hex: '#242424' },
      { name: 'Classic Navy', hex: '#1B263B' },
      { name: 'Taupe Khaki', hex: '#9E9281' }
    ],
    inStock: true,
    stockCount: 12,
    fabric: 'Poly-Viscose Stretch Twill',
    fit: 'Tailored Comfort Fit',
    isFeatured: false,
    isNewArrival: true,
    rating: 4.6,
    reviewCount: 29
  },
  {
    id: 'men-6',
    name: "Vintage Linen Short-Sleeve Shirt",
    price: 849,
    originalPrice: 1099,
    discountPercentage: 22,
    category: 'men',
    subCategory: 'casual-wear',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Breathable Cuban collar resort shirt crafted from premium linen-cotton slub. Natural cooling effect with a relaxed drape suited for sunny afternoons.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Natural Ecru', hex: '#EDE6D8' },
      { name: 'Sage Olive', hex: '#63755C' },
      { name: 'Burnt Ochre', hex: '#B5651D' }
    ],
    inStock: true,
    stockCount: 10,
    fabric: '55% French Linen, 45% Cotton',
    fit: 'Relaxed Resort Fit',
    isFeatured: true,
    isOffer: true,
    rating: 4.9,
    reviewCount: 31
  },
  {
    id: 'men-7',
    name: "Kerala Traditional Kasavu Kurta Set",
    price: 1399,
    originalPrice: 1799,
    discountPercentage: 22,
    category: 'men',
    subCategory: 'traditional-wear',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Handloom cream cotton kurta finished with intricate antique zari piping along the placket. Ideal for weddings, Onam, Eid, and grand family gatherings.',
    sizes: ['38', '40', '42', '44'],
    colors: [
      { name: 'Ivory Gold Border', hex: '#F9F5EC' },
      { name: 'Muted Maroon Placket', hex: '#6B1724' }
    ],
    inStock: true,
    stockCount: 7,
    fabric: 'Pure Kerala Handloom Cotton',
    fit: 'Traditional Regular Fit',
    isFeatured: true,
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 48
  },
  {
    id: 'men-8',
    name: "Washed Cotton Cargo Trousers",
    price: 1099,
    originalPrice: 1399,
    discountPercentage: 21,
    category: 'men',
    subCategory: 'casual-wear',
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Heavyweight garment-dyed cotton utility pants with secure flap pockets and reinforced knee panels. Built for rugged weekend journeys.',
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Military Olive', hex: '#444E3D' },
      { name: 'Field Khaki', hex: '#B8A484' }
    ],
    inStock: true,
    stockCount: 9,
    fabric: '100% Washed Cotton Canvas',
    fit: 'Tapered Utility Fit',
    isFeatured: false,
    rating: 4.7,
    reviewCount: 22
  },

  // =========================================================================
  // KIDS' CLOTHING COLLECTION
  // =========================================================================
  {
    id: 'kid-1',
    name: "Kids' Graphic Printed T-Shirt",
    price: 349,
    originalPrice: 449,
    discountPercentage: 22,
    category: 'kids',
    subCategory: 'kids-t-shirts',
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Playful vintage travel badge print on buttery soft combed cotton. Non-toxic organic dyes and tagless neckline for zero scratchiness.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    colors: [
      { name: 'Mustard Gold', hex: '#D4AF37' },
      { name: 'Forest Green', hex: '#2E4C38' },
      { name: 'Dusty Orange', hex: '#C86438' }
    ],
    inStock: true,
    stockCount: 25,
    fabric: '100% Super-Combed Bio Cotton',
    fit: 'Easy Play Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.9,
    reviewCount: 52
  },
  {
    id: 'kid-2',
    name: "Boys' Classic Oxford Check Shirt",
    price: 499,
    originalPrice: 699,
    discountPercentage: 28,
    category: 'kids',
    subCategory: 'boys-shirts',
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Charming mini gentleman button-down with soft roll-up sleeve tabs. Gentle on young skin while looking dapper for family outings and church/temple visits.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
    colors: [
      { name: 'Navy & Cream Check', hex: '#21334E' },
      { name: 'Burgundy Tattersall', hex: '#631B24' }
    ],
    inStock: true,
    stockCount: 18,
    fabric: '100% Pre-Shrunk Pure Cotton',
    fit: 'Smart Regular Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.8,
    reviewCount: 40
  },
  {
    id: 'kid-3',
    name: "Kids' Comfort Stretch Denim Pants",
    price: 699,
    originalPrice: 899,
    discountPercentage: 22,
    category: 'kids',
    subCategory: 'pants-shorts',
    images: [
      'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Super-flexible soft denim featuring an adjustable inner elastic waistband. Accommodates growing kids while withstanding playground adventures.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    colors: [
      { name: 'Classic Medium Blue', hex: '#375778' },
      { name: 'Washed Charcoal', hex: '#333333' }
    ],
    inStock: true,
    stockCount: 15,
    fabric: 'Soft Cotton-Rich Denim with Spandex',
    fit: 'Flexible Straight Fit',
    isFeatured: true,
    isTrending: true,
    rating: 4.7,
    reviewCount: 34
  },
  {
    id: 'kid-4',
    name: "Kids' Festive Party Wear Waistcoat Outfit",
    price: 899,
    originalPrice: 1199,
    discountPercentage: 25,
    category: 'kids',
    subCategory: 'party-wear',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Delightful 3-piece celebratory set with a structured tweed-look waistcoat, coordinating poplin shirt, and soft trousers with detachable bow tie.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    colors: [
      { name: 'Antique Gold & Navy', hex: '#C5A059' },
      { name: 'Burgundy & Ivory', hex: '#6B1724' }
    ],
    inStock: true,
    stockCount: 9,
    fabric: 'Breathable Cotton Linen Blend',
    fit: 'Tailored Party Fit',
    isFeatured: true,
    isOffer: true,
    rating: 4.9,
    reviewCount: 46
  },
  {
    id: 'kid-5',
    name: "Boys' Vintage Striped Polo T-Shirt",
    price: 449,
    originalPrice: 599,
    discountPercentage: 25,
    category: 'kids',
    subCategory: 'kids-t-shirts',
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Sporty retro feeder stripe polo with a soft ribbed collar and wooden buttons. Keeps young boys comfortable from morning school to evening turf football.',
    sizes: ['4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'],
    colors: [
      { name: 'Navy & White Stripe', hex: '#1C2E4A' },
      { name: 'Olive & Gold Stripe', hex: '#4D5D46' }
    ],
    inStock: true,
    stockCount: 19,
    fabric: '100% Pique Cotton',
    fit: 'Regular Polo Fit',
    isFeatured: false,
    isNewArrival: true,
    rating: 4.6,
    reviewCount: 27
  },
  {
    id: 'kid-6',
    name: "Boys' Cotton Chino Shorts Set",
    price: 549,
    originalPrice: 699,
    discountPercentage: 21,
    category: 'kids',
    subCategory: 'pants-shorts',
    images: [
      'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=80'
    ],
    description: 'Smart knee-length twill shorts with adjustable waist tie and roomy pockets. Ideal for summer holidays and family picnics.',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    colors: [
      { name: 'Vintage Khaki', hex: '#C2B092' },
      { name: 'Olive Green', hex: '#586A51' }
    ],
    inStock: true,
    stockCount: 14,
    fabric: '100% Washed Cotton Twill',
    fit: 'Comfort Fit',
    isFeatured: false,
    isOffer: true,
    rating: 4.8,
    reviewCount: 19
  }
];
