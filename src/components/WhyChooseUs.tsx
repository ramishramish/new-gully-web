import React from 'react';
import { ShieldCheck, Users, HeartHandshake, History } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Quality Clothing",
      description: "Carefully sourced natural cottons, reinforced stitch work, and durable colorfast fabrics made to endure daily wear."
    },
    {
      icon: Users,
      title: "Styles for Every Generation",
      description: "From grandfather & father tailored classics to young boys' celebration outfits, clothing that unites generations in style."
    },
    {
      icon: HeartHandshake,
      title: "Everyday Comfort",
      description: "Designed specifically for Kerala's tropical lifestyle with breathable weaves, soft linings, and flexible waistbands."
    },
    {
      icon: History,
      title: "Established in 2016",
      description: "Nearly a decade of proud, friendly service at Palikkal Bazar, Malappuram — founded on honest pricing and genuine care."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-vintage-cream border-b border-vintage-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block mb-1">
            THE NEW GULLY STANDARD
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-vintage-brown">
            Why Choose NEW GULLY?
          </h2>
          <div className="w-12 h-0.5 bg-vintage-gold mx-auto my-3" />
          <p className="text-xs md:text-sm text-vintage-muted">
            Our values remain true to the day we opened our doors in Palikkal Bazar in 2016.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-vintage-ivory/60 p-6 rounded border border-vintage-border hover:border-vintage-gold hover:shadow-vintage transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded bg-vintage-cream border border-vintage-border flex items-center justify-center mb-4 group-hover:bg-vintage-burgundy group-hover:border-vintage-burgundy transition-colors">
                  <Icon className="w-6 h-6 text-vintage-gold group-hover:text-vintage-cream transition-colors" />
                </div>
                <h3 className="font-serif font-bold text-lg text-vintage-brown mb-2 group-hover:text-vintage-burgundy transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-vintage-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
