import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'men-shirts' | 'men-trousers' | 'kids'>('men-shirts');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-vintage-charcoal/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSizeGuideOpen(false)}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        <div className="inline-block w-full max-w-2xl p-6 md:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-vintage-cream shadow-2xl rounded border border-vintage-border relative z-10">
          
          <div className="flex items-center justify-between pb-4 border-b border-vintage-border mb-6">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-vintage-gold" />
              <h3 className="font-serif text-xl font-bold text-vintage-brown">
                NEW GULLY Size &amp; Fit Guide
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="p-1.5 text-vintage-muted hover:text-vintage-burgundy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Guide Tabs */}
          <div className="flex border-b border-vintage-border mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('men-shirts')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'men-shirts'
                  ? 'border-vintage-burgundy text-vintage-burgundy'
                  : 'border-transparent text-vintage-muted hover:text-vintage-brown'
              }`}
            >
              Men's Shirts &amp; Tees
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('men-trousers')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'men-trousers'
                  ? 'border-vintage-burgundy text-vintage-burgundy'
                  : 'border-transparent text-vintage-muted hover:text-vintage-brown'
              }`}
            >
              Men's Jeans &amp; Trousers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kids')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'kids'
                  ? 'border-vintage-burgundy text-vintage-burgundy'
                  : 'border-transparent text-vintage-muted hover:text-vintage-brown'
              }`}
            >
              Kids' Clothing by Age
            </button>
          </div>

          {/* Tables */}
          <div className="overflow-x-auto text-xs">
            {activeTab === 'men-shirts' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-vintage-ivory text-vintage-brown border-b border-vintage-border">
                    <th className="py-2.5 px-3 font-bold uppercase">Size</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Chest (Inches)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Shoulder (Inches)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vintage-border/60 text-vintage-brown">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">S (38)</td>
                    <td className="py-2.5 px-3">38 - 39</td>
                    <td className="py-2.5 px-3">17.5</td>
                    <td className="py-2.5 px-3">28.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">M (40)</td>
                    <td className="py-2.5 px-3">40 - 41</td>
                    <td className="py-2.5 px-3">18.2</td>
                    <td className="py-2.5 px-3">29.0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">L (42)</td>
                    <td className="py-2.5 px-3">42 - 43</td>
                    <td className="py-2.5 px-3">19.0</td>
                  <td className="py-2.5 px-3">29.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">XL (44)</td>
                    <td className="py-2.5 px-3">44 - 45</td>
                    <td className="py-2.5 px-3">19.8</td>
                    <td className="py-2.5 px-3">30.2</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">XXL (46)</td>
                    <td className="py-2.5 px-3">46 - 47</td>
                    <td className="py-2.5 px-3">20.5</td>
                    <td className="py-2.5 px-3">31.0</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 'men-trousers' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-vintage-ivory text-vintage-brown border-b border-vintage-border">
                    <th className="py-2.5 px-3 font-bold uppercase">Waist Size</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Hip (Inches)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Inseam (Inches)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Outseam (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vintage-border/60 text-vintage-brown">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">30</td>
                    <td className="py-2.5 px-3">37 - 38</td>
                    <td className="py-2.5 px-3">31.5</td>
                    <td className="py-2.5 px-3">40.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">32</td>
                    <td className="py-2.5 px-3">39 - 40</td>
                    <td className="py-2.5 px-3">32.0</td>
                    <td className="py-2.5 px-3">41.0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">34</td>
                    <td className="py-2.5 px-3">41 - 42</td>
                    <td className="py-2.5 px-3">32.0</td>
                    <td className="py-2.5 px-3">41.5</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">36</td>
                    <td className="py-2.5 px-3">43 - 44</td>
                    <td className="py-2.5 px-3">32.5</td>
                    <td className="py-2.5 px-3">42.0</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">38</td>
                    <td className="py-2.5 px-3">45 - 46</td>
                    <td className="py-2.5 px-3">32.5</td>
                    <td className="py-2.5 px-3">42.5</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 'kids' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-vintage-ivory text-vintage-brown border-b border-vintage-border">
                    <th className="py-2.5 px-3 font-bold uppercase">Age Group</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Child Height (cm)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Chest (Inches)</th>
                    <th className="py-2.5 px-3 font-bold uppercase">Waist (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vintage-border/60 text-vintage-brown">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">2 - 3 Years</td>
                    <td className="py-2.5 px-3">92 - 98 cm</td>
                    <td className="py-2.5 px-3">21 - 22</td>
                    <td className="py-2.5 px-3">20 - 21</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">4 - 5 Years</td>
                    <td className="py-2.5 px-3">104 - 110 cm</td>
                    <td className="py-2.5 px-3">23 - 24</td>
                    <td className="py-2.5 px-3">21 - 22</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">6 - 7 Years</td>
                    <td className="py-2.5 px-3">116 - 122 cm</td>
                    <td className="py-2.5 px-3">25 - 26</td>
                    <td className="py-2.5 px-3">22 - 23</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">8 - 9 Years</td>
                    <td className="py-2.5 px-3">128 - 134 cm</td>
                    <td className="py-2.5 px-3">27 - 28</td>
                    <td className="py-2.5 px-3">24 - 25</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold">10 - 11 Years</td>
                    <td className="py-2.5 px-3">140 - 146 cm</td>
                    <td className="py-2.5 px-3">29 - 30</td>
                    <td className="py-2.5 px-3">25 - 26</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-vintage-border flex items-center justify-between text-xs text-vintage-muted">
            <p>Tip: If your measurement falls between two sizes, we suggest choosing the larger size for extra comfort.</p>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="btn-vintage-secondary py-1.5 px-4 text-xs shrink-0 ml-4"
            >
              GOT IT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
