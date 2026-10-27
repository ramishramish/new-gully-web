export interface MarqueeMessage {
  id: string;
  text: string;
  link?: string;
  badge?: string;
}

export const PROMOTIONAL_MESSAGES: MarqueeMessage[] = [
  {
    id: "m1",
    text: "WELCOME TO NEW GULLY — STYLE THAT NEVER GOES OUT OF FASHION",
    badge: "EST. 2016"
  },
  {
    id: "m2",
    text: "THE STYLE SALE: UP TO 30% OFF SELECTED ESSENTIALS",
    link: "/offers",
    badge: "LIMITED TIME"
  },
  {
    id: "m3",
    text: "MEN'S & KIDS' COLLECTIONS — EXPLORE YOUR STYLE",
    link: "/mens"
  },
  {
    id: "m4",
    text: "FREE DELIVERY ON ORDERS ABOVE ₹999 ACROSS KERALA",
    link: "/offers"
  },
  {
    id: "m5",
    text: "VISIT OUR PALIKKAL BAZAR STORE FOR BESPOKE FIT & WARM HOSPITALITY",
    link: "/contact"
  }
];
