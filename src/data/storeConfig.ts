export interface StoreConfig {
  name: string;
  tagline: string;
  established: number;
  businessType: string;
  location: string;
  area: string;
  district: string;
  state: string;
  country: string;
  currency: string;
  currencySymbol: string;
  phoneDisplay: string;
  realPhoneConfigured: boolean;
  realPhoneNumber: string;
  whatsappDisplay: string;
  realWhatsAppConfigured: boolean;
  realWhatsAppNumber: string;
  email: string;
  businessHours: {
    weekdays: string;
    weekends: string;
    note: string;
  };
  maps: {
    searchUrl: string;
    directionsUrl: string;
    embedUrl: string;
    placeLabel: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  delivery: {
    freeDeliveryThreshold: number;
    standardDeliveryCharge: number;
    estimatedDays: string;
  };
}

export const STORE_CONFIG: StoreConfig = {
  name: "NEW GULLY",
  tagline: "TIMELESS STYLE. EVERYDAY COMFORT.",
  established: 2016,
  businessType: "Men's and Kids' Clothing Store",
  location: "Palikkal Bazar, Malappuram, Kerala, India",
  area: "Palikkal Bazar",
  district: "Malappuram",
  state: "Kerala",
  country: "India",
  currency: "INR",
  currencySymbol: "₹",

  phoneDisplay: "+91 98460 XXXXX",
  realPhoneConfigured: false,
  realPhoneNumber: "",

  whatsappDisplay: "+91 98460 XXXXX",
  realWhatsAppConfigured: false,
  realWhatsAppNumber: "",

  email: "care@newgully.com",

  businessHours: {
    weekdays: "9:30 AM – 9:30 PM",
    weekends: "9:30 AM – 10:00 PM",
    note: "Open all 7 days of the week"
  },

  maps: {
    searchUrl: "https://www.google.com/maps/search/?api=1&query=Palikkal+Bazar+Malappuram+Kerala",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Palikkal+Bazar%2C+Malappuram%2C+Kerala%2C+India",
    embedUrl: "https://maps.google.com/maps?q=Palikkal+Bazar%2C+Malappuram%2C+Kerala%2C+India&t=&z=15&ie=UTF8&iwloc=&output=embed",
    placeLabel: "Palikkal Bazar, Malappuram, Kerala, India"
  },

  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },

  delivery: {
    freeDeliveryThreshold: 999,
    standardDeliveryCharge: 60,
    estimatedDays: "3–5 business days"
  }
};

/**
 * Returns formatted WhatsApp enquiry link or fallback instructions
 */
export function getWhatsAppEnquiryUrl(productName?: string, price?: number): string | null {
  if (!STORE_CONFIG.realWhatsAppConfigured || !STORE_CONFIG.realWhatsAppNumber) {
    return null;
  }
  
  let text = `Hello NEW GULLY, I would like to enquire about your store collections.`;
  if (productName && price !== undefined) {
    text = `Hello NEW GULLY, I am interested in: "${productName}" (Price: ₹${price.toLocaleString('en-IN')}). Is this available at your Palikkal Bazar store?`;
  }
  
  return `https://wa.me/${STORE_CONFIG.realWhatsAppNumber}?text=${encodeURIComponent(text)}`;
}
