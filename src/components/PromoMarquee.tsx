import React from 'react';
import { Link } from 'react-router-dom';
import { PROMOTIONAL_MESSAGES } from '../data/marqueeMessages';
import { Sparkles } from 'lucide-react';
import { marqueeSettings } from '../lib/hydrate';

export const PromoMarquee: React.FC = () => {
  // Duplicate messages twice to allow seamless continuous loop without gaps
  if (!marqueeSettings.enabled || PROMOTIONAL_MESSAGES.length === 0) return null;
  const doubledMessages = [...PROMOTIONAL_MESSAGES, ...PROMOTIONAL_MESSAGES];

  return (
    <div 
      className="bg-vintage-burgundy text-vintage-cream border-b border-vintage-burgundy-dark overflow-hidden py-2 text-xs md:text-sm font-medium tracking-wider relative z-30"
      aria-label="Promotional announcements"
    >
      <div
        className="flex animate-marquee whitespace-nowrap items-center select-none"
        style={{ animationDuration: `${marqueeSettings.speed}s`, animationDirection: marqueeSettings.direction === 'right' ? 'reverse' : 'normal' }}
      >
        {doubledMessages.map((msg, index) => (
          <div key={`${msg.id}-${index}`} className="flex items-center space-x-6 mx-6">
            {msg.link ? (
              <Link 
                to={msg.link} 
                className="hover:text-vintage-gold transition-colors inline-flex items-center space-x-2"
              >
                {msg.badge && (
                  <span className="bg-vintage-gold text-vintage-brown-dark text-[10px] font-bold px-1.5 py-0.5 rounded tracking-normal uppercase">
                    {msg.badge}
                  </span>
                )}
                <span>{msg.text}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center space-x-2">
                {msg.badge && (
                  <span className="bg-vintage-gold text-vintage-brown-dark text-[10px] font-bold px-1.5 py-0.5 rounded tracking-normal uppercase">
                    {msg.badge}
                  </span>
                )}
                <span>{msg.text}</span>
              </span>
            )}
            <Sparkles className="w-3 h-3 text-vintage-gold shrink-0 opacity-80" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
};
