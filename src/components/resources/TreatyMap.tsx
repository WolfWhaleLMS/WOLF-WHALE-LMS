'use client';

import { useState } from 'react';

interface Treaty {
  id: number;
  name: string;
  year: string;
  nations: string[];
  location: string;
  keyPromises: string[];
  description: string;
  path: string;
  labelX: number;
  labelY: number;
}

const treaties: Treaty[] = [
  {
    id: 1,
    name: 'Treaty 1',
    year: '1871',
    nations: ['Anishinaabe (Ojibwe)', 'Swampy Cree'],
    location: 'Southern Manitoba',
    keyPromises: ['Reserve lands', 'Annuities ($3/person)', 'Schools on reserves', 'Farming equipment'],
    description: 'Treaty 1 was the first of the Numbered Treaties, signed at Lower Fort Garry. It established the template for subsequent treaties, though many promises made orally were not included in the written text.',
    path: 'M280,320 L320,300 L340,320 L330,360 L290,370 Z',
    labelX: 305,
    labelY: 335,
  },
  {
    id: 2,
    name: 'Treaty 2',
    year: '1871',
    nations: ['Anishinaabe (Ojibwe)'],
    location: 'Southern Manitoba',
    keyPromises: ['Reserve lands', 'Annuities', 'Agricultural implements', 'Hunting and fishing rights'],
    description: 'Treaty 2 was signed just months after Treaty 1 and covered additional territory in Manitoba. Like Treaty 1, oral promises were later disputed.',
    path: 'M240,290 L280,280 L280,320 L290,370 L250,380 L220,350 Z',
    labelX: 255,
    labelY: 330,
  },
  {
    id: 3,
    name: 'Treaty 3',
    year: '1873',
    nations: ['Anishinaabe (Ojibwe)', 'Saulteaux'],
    location: 'Northwestern Ontario, Eastern Manitoba',
    keyPromises: ['Reserve lands', 'Annuities ($5/person)', 'Hunting and trapping rights', 'Schools'],
    description: 'Treaty 3, also known as the Northwest Angle Treaty, was significant for establishing increased annuities and including provisions that became standard in later treaties.',
    path: 'M300,250 L360,230 L380,260 L360,300 L320,300 L280,280 Z',
    labelX: 330,
    labelY: 270,
  },
  {
    id: 4,
    name: 'Treaty 4',
    year: '1874',
    nations: ['Cree', 'Saulteaux (Ojibwe)', 'Nakota (Assiniboine)'],
    location: 'Southern Saskatchewan, Southeastern Alberta',
    keyPromises: ['Reserve lands', 'Annuities', 'Agricultural assistance', 'Ammunition', 'Twine'],
    description: 'Treaty 4, the Qu\'Appelle Treaty, covered a large area of the prairies. Negotiations were complex, with Chiefs expressing concerns about the disappearing buffalo.',
    path: 'M160,300 L240,290 L250,380 L240,420 L160,420 L130,360 Z',
    labelX: 190,
    labelY: 355,
  },
  {
    id: 5,
    name: 'Treaty 5',
    year: '1875',
    nations: ['Swampy Cree', 'Saulteaux'],
    location: 'Central Manitoba, Northern Ontario',
    keyPromises: ['Reserve lands', 'Annuities', 'Hunting and fishing rights', 'Schools'],
    description: 'Treaty 5 covered the area around Lake Winnipeg and was later expanded through adhesions to include additional First Nations.',
    path: 'M280,180 L340,160 L380,200 L380,260 L360,300 L320,300 L280,280 L260,220 Z',
    labelX: 315,
    labelY: 230,
  },
  {
    id: 6,
    name: 'Treaty 6',
    year: '1876',
    nations: ['Plains Cree', 'Woodland Cree', 'Nakota Sioux', 'Saulteaux'],
    location: 'Central Saskatchewan, Central Alberta',
    keyPromises: ['Medicine Chest clause (healthcare)', 'Reserve lands', 'Education', 'Farming assistance', 'Famine relief'],
    description: 'Treaty 6 is notable for the "Medicine Chest" clause, which First Nations interpret as a promise of comprehensive healthcare. Chiefs like Big Bear initially refused to sign, seeking better terms.',
    path: 'M80,280 L160,260 L160,300 L160,420 L80,420 L60,360 Z',
    labelX: 115,
    labelY: 340,
  },
  {
    id: 7,
    name: 'Treaty 7',
    year: '1877',
    nations: ['Blackfoot (Siksika, Piikani, Kainai)', 'Tsuu T\'ina', 'Nakoda (Stoney)'],
    location: 'Southern Alberta',
    keyPromises: ['Reserve lands', 'Annuities', 'Cattle', 'Ammunition', 'Agricultural assistance'],
    description: 'Treaty 7 was signed at Blackfoot Crossing. The Blackfoot Confederacy entered the treaty facing the imminent extinction of the buffalo. Oral histories suggest different understandings of what was agreed.',
    path: 'M40,340 L80,320 L80,420 L60,460 L30,460 L20,400 Z',
    labelX: 50,
    labelY: 390,
  },
  {
    id: 8,
    name: 'Treaty 8',
    year: '1899',
    nations: ['Cree', 'Dene (Chipewyan, Slavey)', 'Beaver'],
    location: 'Northern Alberta, NE BC, NW Saskatchewan, Southern NWT',
    keyPromises: ['Reserve lands', 'Hunting/fishing/trapping rights', 'Annuities', 'Tools and equipment'],
    description: 'Treaty 8 was driven by the Klondike Gold Rush and the need for Canadian sovereignty in the north. It covers the largest area of any numbered treaty.',
    path: 'M30,180 L80,140 L160,140 L200,180 L200,260 L160,260 L80,280 L60,280 L30,240 Z',
    labelX: 110,
    labelY: 210,
  },
  {
    id: 9,
    name: 'Treaty 9',
    year: '1905-1906',
    nations: ['Cree', 'Ojibwe'],
    location: 'Northern Ontario',
    keyPromises: ['Reserve lands', 'Annuities', 'Hunting and fishing rights', 'Education'],
    description: 'Treaty 9, the James Bay Treaty, was unique in being negotiated jointly by Canada and Ontario. It was expanded through adhesions in 1929-30.',
    path: 'M360,160 L420,140 L460,180 L460,260 L420,280 L380,260 L360,200 Z',
    labelX: 410,
    labelY: 210,
  },
  {
    id: 10,
    name: 'Treaty 10',
    year: '1906',
    nations: ['Dene (Chipewyan)', 'Cree'],
    location: 'Northern Saskatchewan, Small area of Alberta',
    keyPromises: ['Reserve lands', 'Hunting/fishing/trapping rights', 'Annuities', 'Education'],
    description: 'Treaty 10 was negotiated following requests from northern First Nations concerned about settlers entering their territories.',
    path: 'M130,160 L200,140 L240,160 L260,220 L240,290 L160,260 L130,200 Z',
    labelX: 190,
    labelY: 215,
  },
  {
    id: 11,
    name: 'Treaty 11',
    year: '1921',
    nations: ['Dene (Slavey, Dogrib, Hare, Loucheux)'],
    location: 'Northwest Territories, Yukon',
    keyPromises: ['Reserve lands', 'Hunting/fishing/trapping rights', 'Annuities', 'Education'],
    description: 'Treaty 11, the last of the numbered treaties, was negotiated following oil discoveries at Norman Wells. First Nations sought recognition of their rights and protection of their way of life.',
    path: 'M60,60 L160,40 L200,80 L200,140 L130,160 L80,140 L40,100 Z',
    labelX: 125,
    labelY: 100,
  },
];

export default function TreatyMap() {
  const [selectedTreaty, setSelectedTreaty] = useState<Treaty | null>(null);
  const [hoveredTreaty, setHoveredTreaty] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ice-block p-6">
        <h2 className="text-2xl font-bold text-[var(--evergreen)] mb-2">Numbered Treaties Map</h2>
        <p className="text-[var(--text-muted)]">
          Click on a treaty region to learn about the nations involved and the sacred promises made
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="ice-block p-4 overflow-hidden">
            {/* Holographic Map Effect Background */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4" style={{ minHeight: '500px' }}>
              {/* Grid Lines for Holographic Effect */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* SVG Map */}
              <svg
                viewBox="0 0 500 500"
                className="w-full h-auto relative z-10"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0, 212, 170, 0.3))' }}
              >
                {/* Glow Filter */}
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="treatyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--aurora-green)" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="hoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--aurora-green)" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Canada Outline (Simplified) */}
                <path
                  d="M20,200 Q40,150 80,120 Q120,90 180,80 Q250,70 320,90 Q380,100 420,130 Q460,160 480,220 L480,400 Q440,420 380,430 Q320,440 260,430 Q200,420 140,400 Q80,380 40,340 L20,280 Z"
                  fill="none"
                  stroke="var(--accent-cyan)"
                  strokeWidth="2"
                  opacity="0.3"
                />

                {/* Treaty Regions */}
                {treaties.map((treaty) => (
                  <g key={treaty.id}>
                    <path
                      d={treaty.path}
                      fill={
                        selectedTreaty?.id === treaty.id
                          ? 'url(#hoverGradient)'
                          : hoveredTreaty === treaty.id
                          ? 'url(#hoverGradient)'
                          : 'url(#treatyGradient)'
                      }
                      stroke={
                        selectedTreaty?.id === treaty.id || hoveredTreaty === treaty.id
                          ? 'var(--aurora-green)'
                          : 'var(--accent-cyan)'
                      }
                      strokeWidth={selectedTreaty?.id === treaty.id || hoveredTreaty === treaty.id ? '3' : '1.5'}
                      className="cursor-pointer transition-all duration-300"
                      filter={selectedTreaty?.id === treaty.id || hoveredTreaty === treaty.id ? 'url(#glow)' : ''}
                      onClick={() => setSelectedTreaty(treaty)}
                      onMouseEnter={() => setHoveredTreaty(treaty.id)}
                      onMouseLeave={() => setHoveredTreaty(null)}
                    />
                    {/* Treaty Number Label */}
                    <text
                      x={treaty.labelX}
                      y={treaty.labelY}
                      fill={selectedTreaty?.id === treaty.id || hoveredTreaty === treaty.id ? '#fff' : 'var(--accent-cyan)'}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}
                    >
                      {treaty.id}
                    </text>
                  </g>
                ))}

                {/* Compass Rose */}
                <g transform="translate(440, 60)">
                  <circle cx="0" cy="0" r="25" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" opacity="0.5" />
                  <text x="0" y="-30" fill="var(--accent-cyan)" fontSize="10" textAnchor="middle" opacity="0.7">N</text>
                  <line x1="0" y1="-20" x2="0" y2="-10" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <polygon points="0,-20 -5,-10 5,-10" fill="var(--accent-cyan)" opacity="0.7" />
                </g>

                {/* Scale Bar */}
                <g transform="translate(30, 470)">
                  <line x1="0" y1="0" x2="60" y2="0" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <line x1="60" y1="-5" x2="60" y2="5" stroke="var(--accent-cyan)" strokeWidth="2" />
                  <text x="30" y="15" fill="var(--accent-cyan)" fontSize="8" textAnchor="middle" opacity="0.7">~500 km</text>
                </g>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 rounded-lg p-3 border border-[var(--accent-cyan)]/30">
                <p className="text-[var(--accent-cyan)] text-xs font-bold mb-2">Numbered Treaties (1871-1921)</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-[var(--accent-cyan)]/60 to-[var(--aurora-green)]/40 border border-[var(--accent-cyan)]"></div>
                  <span className="text-white/70 text-xs">Treaty Region</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Treaty List */}
          <div className="mt-4 grid grid-cols-6 md:grid-cols-11 gap-2">
            {treaties.map((treaty) => (
              <button
                key={treaty.id}
                onClick={() => setSelectedTreaty(treaty)}
                className={`p-2 rounded-lg text-center font-bold text-sm transition-all ${
                  selectedTreaty?.id === treaty.id
                    ? 'bg-[var(--aurora-green)] text-white'
                    : 'bg-[var(--ice-blue)]/50 text-[var(--evergreen)] hover:bg-[var(--aurora-green)]/20'
                }`}
              >
                {treaty.id}
              </button>
            ))}
          </div>
        </div>

        {/* Treaty Details Panel */}
        <div className="lg:col-span-1">
          {selectedTreaty ? (
            <div className="ice-block p-6 sticky top-4">
              {/* Treaty Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--aurora-green)] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedTreaty.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--evergreen)]">{selectedTreaty.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{selectedTreaty.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTreaty(null)}
                  className="p-2 rounded-lg hover:bg-[var(--ice-blue)]/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Location */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">Location</h4>
                <p className="text-[var(--text-secondary)]">{selectedTreaty.location}</p>
              </div>

              {/* Nations */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Nations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTreaty.nations.map((nation, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30"
                    >
                      {nation}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Promises */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Key Promises</h4>
                <ul className="space-y-1">
                  {selectedTreaty.keyPromises.map((promise, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="text-[var(--aurora-green)] mt-1">•</span>
                      {promise}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-[var(--frost-border)]">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Historical Context</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedTreaty.description}</p>
              </div>

              {/* Treaty Rights Reminder */}
              <div className="mt-4 p-3 rounded-xl bg-[var(--aurora-green)]/10 border border-[var(--aurora-green)]/30">
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--evergreen)]">Remember:</span> Treaty rights are constitutionally protected under Section 35 of the Constitution Act, 1982. These are living agreements that continue to shape relationships today.
                </p>
              </div>
            </div>
          ) : (
            <div className="ice-block p-6 text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="font-bold text-[var(--evergreen)] mb-2">Select a Treaty</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Click on a numbered region on the map or use the buttons below to learn about each treaty
              </p>
              <div className="mt-6 p-4 rounded-xl bg-[var(--ice-blue)]/30">
                <h4 className="font-semibold text-[var(--evergreen)] text-sm mb-2">Understanding Treaties</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  The Numbered Treaties (1-11) were signed between 1871 and 1921. Indigenous peoples understood these as sacred agreements to share the land while maintaining their rights and way of life.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Footer */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">🤝</div>
          <div>
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">Treaty Relationships</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Treaties are not historical artifacts - they are living agreements that define the relationship between
              Indigenous peoples and the Crown. Understanding treaty rights and responsibilities is essential for
              all Canadians, as we are all treaty people. Many treaty promises remain unfulfilled, and Indigenous
              communities continue to advocate for the full implementation of treaty rights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
