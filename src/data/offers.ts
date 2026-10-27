import { PromotionalOffer } from '../types';

export const PROMOTIONAL_OFFERS: PromotionalOffer[] = [
  {
    id: 'offer-1',
    code: 'VINTAGE20',
    title: 'THE STYLE SALE',
    subtitle: 'Classic everyday essentials crafted for comfort',
    discountBadge: 'UP TO 25% OFF',
    description: 'Enjoy exceptional seasonal savings across selected Men\'s linen shirts, formal trousers, and Kids\' festive outfits.',
    validUntil: '2026-11-30',
    targetCategory: 'all',
    minOrderValue: 999,
    terms: [
      'Valid on selected styles marked with the Offer badge.',
      'Applicable on online demonstration orders and in-store at Palikkal Bazar.',
      'Cannot be combined with clearance promotional vouchers.'
    ]
  },
  {
    id: 'offer-2',
    code: 'MENSWEEK',
    title: "GENTLEMAN'S WARDROBE",
    subtitle: 'Shirts, Stretch Denim & Formal Trousers',
    discountBadge: 'FLAT 20% OFF',
    description: 'Upgrade your work and evening rotation with tailored cotton shirts and premium stretch denim.',
    validUntil: '2026-11-15',
    targetCategory: 'men',
    minOrderValue: 1200,
    terms: [
      'Valid exclusively on the Men\'s Collection.',
      'Minimum cart value of ₹1,200 required.',
      'Sizes subject to in-store availability.'
    ]
  },
  {
    id: 'offer-3',
    code: 'LITTLECHAMPS',
    title: "KIDS' PLAY & CELEBRATE",
    subtitle: 'Soft cotton tees, shorts & party waistcoats',
    discountBadge: 'SPECIAL BUNDLE',
    description: 'Buy any 2 kids t-shirts or shorts and receive special celebratory store pricing.',
    validUntil: '2026-12-31',
    targetCategory: 'kids',
    minOrderValue: 699,
    terms: [
      'Applies to boys\' shirts, tees, and festive wear.',
      'All dyes and fabrics are 100% skin-safe and pre-washed.'
    ]
  }
];
