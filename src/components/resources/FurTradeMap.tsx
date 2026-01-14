'use client';

import { useState, useMemo } from 'react';

interface TradingPost {
  id: string;
  name: string;
  company: 'HBC' | 'NWC' | 'BOTH';
  yearEstablished: number;
  yearClosed?: number;
  x: number;
  y: number;
  description: string;
  significance: string;
}

interface TradeRoute {
  id: string;
  name: string;
  company: 'HBC' | 'NWC';
  yearStart: number;
  yearEnd: number;
  path: string;
  description: string;
}

const tradingPosts: TradingPost[] = [
  {
    id: 'york-factory',
    name: 'York Factory',
    company: 'HBC',
    yearEstablished: 1684,
    x: 290,
    y: 165,
    description: 'The main depot of the HBC for nearly 250 years, located at the mouth of the Hayes River on Hudson Bay.',
    significance: 'York Factory was the hub of the entire HBC trading network, where goods from England were exchanged for furs brought from across the continent.',
  },
  {
    id: 'churchill',
    name: 'Fort Churchill',
    company: 'HBC',
    yearEstablished: 1717,
    x: 260,
    y: 140,
    description: 'A fortified trading post on the western shore of Hudson Bay, built to compete with French traders.',
    significance: 'Fort Churchill (later Prince of Wales Fort) was one of the northernmost posts and key to trading with the Chipewyan and other northern peoples.',
  },
  {
    id: 'albany',
    name: 'Fort Albany',
    company: 'HBC',
    yearEstablished: 1679,
    x: 350,
    y: 200,
    description: 'One of the oldest HBC posts, established on James Bay at the mouth of the Albany River.',
    significance: 'Fort Albany served as a vital southern gateway for the HBC, trading with Cree and Ojibwe peoples.',
  },
  {
    id: 'montreal',
    name: 'Montreal',
    company: 'NWC',
    yearEstablished: 1670,
    x: 420,
    y: 280,
    description: 'The headquarters of the North West Company and center of the Canadian fur trade.',
    significance: 'Montreal was where NWC partners met annually, furs were processed, and trade goods were organized for the interior.',
  },
  {
    id: 'grand-portage',
    name: 'Grand Portage',
    company: 'NWC',
    yearEstablished: 1768,
    yearClosed: 1803,
    x: 330,
    y: 250,
    description: 'The great annual rendezvous point for NWC traders on Lake Superior.',
    significance: 'Each summer, voyageurs from Montreal met winterers from the interior to exchange goods and furs at this crucial meeting point.',
  },
  {
    id: 'fort-william',
    name: 'Fort William',
    company: 'NWC',
    yearEstablished: 1803,
    x: 340,
    y: 245,
    description: 'Replaced Grand Portage as the NWC inland headquarters after border disputes.',
    significance: 'Fort William became the largest fur trade post in the world, hosting the annual rendezvous until the 1821 merger.',
  },
  {
    id: 'fort-chipewyan',
    name: 'Fort Chipewyan',
    company: 'NWC',
    yearEstablished: 1788,
    x: 160,
    y: 145,
    description: 'The oldest continuous European settlement in Alberta, on Lake Athabasca.',
    significance: 'Gateway to the rich Athabasca fur country and launching point for Arctic and Pacific expeditions.',
  },
  {
    id: 'cumberland-house',
    name: 'Cumberland House',
    company: 'HBC',
    yearEstablished: 1774,
    x: 230,
    y: 195,
    description: 'The first HBC inland trading post, built in response to NWC competition.',
    significance: 'Marked the HBC\'s shift from waiting at bay posts to actively trading in the interior.',
  },
  {
    id: 'fort-garry',
    name: 'Fort Garry',
    company: 'BOTH',
    yearEstablished: 1822,
    x: 270,
    y: 240,
    description: 'Located at the Forks of the Red and Assiniboine Rivers (modern Winnipeg).',
    significance: 'After the 1821 merger, Fort Garry became a key administrative center for the combined company.',
  },
  {
    id: 'fort-edmonton',
    name: 'Fort Edmonton',
    company: 'HBC',
    yearEstablished: 1795,
    x: 145,
    y: 190,
    description: 'Major post on the North Saskatchewan River, hub for the western prairies.',
    significance: 'Fort Edmonton served as a provisioning center and gateway to the Rocky Mountains.',
  },
  {
    id: 'fort-vancouver',
    name: 'Fort Vancouver',
    company: 'HBC',
    yearEstablished: 1825,
    x: 60,
    y: 260,
    description: 'HBC headquarters for the Columbia District on the Pacific Coast.',
    significance: 'Center of the Pacific fur trade and HBC operations west of the Rockies.',
  },
  {
    id: 'fort-victoria',
    name: 'Fort Victoria',
    company: 'HBC',
    yearEstablished: 1843,
    x: 45,
    y: 235,
    description: 'Established on Vancouver Island as a Pacific headquarters.',
    significance: 'Became the capital of British Columbia and marked HBC\'s lasting presence on the Pacific.',
  },
  {
    id: 'rainy-lake',
    name: 'Fort Lac La Pluie',
    company: 'NWC',
    yearEstablished: 1731,
    x: 300,
    y: 235,
    description: 'Strategic post on the voyageur route between Lake Superior and Lake Winnipeg.',
    significance: 'Critical rest and resupply point on the long canoe route to the interior.',
  },
  {
    id: 'rocky-mountain',
    name: 'Rocky Mountain House',
    company: 'BOTH',
    yearEstablished: 1799,
    x: 120,
    y: 200,
    description: 'Trading post at the foot of the Rocky Mountains.',
    significance: 'Key point for trade with the Blackfoot Confederacy and gateway to mountain passes.',
  },
];

const tradeRoutes: TradeRoute[] = [
  {
    id: 'hbc-bay-route',
    name: 'Hudson Bay Route',
    company: 'HBC',
    yearStart: 1670,
    yearEnd: 1870,
    path: 'M290,165 Q310,200 290,230 Q275,250 270,240',
    description: 'The primary HBC route from York Factory inland via the Hayes and Nelson Rivers.',
  },
  {
    id: 'hbc-churchill-route',
    name: 'Churchill Route',
    company: 'HBC',
    yearStart: 1717,
    yearEnd: 1870,
    path: 'M260,140 Q220,150 180,160 Q160,155 160,145',
    description: 'Northern route from Fort Churchill to Fort Chipewyan and the Athabasca country.',
  },
  {
    id: 'hbc-saskatchewan',
    name: 'Saskatchewan Route',
    company: 'HBC',
    yearStart: 1774,
    yearEnd: 1870,
    path: 'M270,240 Q240,220 230,195 Q200,190 145,190 Q130,195 120,200',
    description: 'HBC route along the Saskatchewan River system to the western prairies.',
  },
  {
    id: 'hbc-columbia',
    name: 'Columbia Express',
    company: 'HBC',
    yearStart: 1825,
    yearEnd: 1870,
    path: 'M270,240 Q200,250 145,250 Q100,255 60,260 Q50,250 45,235',
    description: 'Route connecting the Pacific posts to the interior via the Columbia River.',
  },
  {
    id: 'nwc-main-route',
    name: 'Montreal-Grand Portage',
    company: 'NWC',
    yearStart: 1779,
    yearEnd: 1821,
    path: 'M420,280 Q400,270 380,265 Q360,260 340,250 Q335,248 330,250',
    description: 'The grueling canoe route from Montreal to the annual rendezvous.',
  },
  {
    id: 'nwc-winnipeg-route',
    name: 'Winnipeg Route',
    company: 'NWC',
    yearStart: 1780,
    yearEnd: 1821,
    path: 'M330,250 Q310,245 300,235 Q285,240 270,240',
    description: 'NWC route from Lake Superior to the Red River and prairies.',
  },
  {
    id: 'nwc-athabasca',
    name: 'Athabasca Brigade',
    company: 'NWC',
    yearStart: 1788,
    yearEnd: 1821,
    path: 'M270,240 Q250,220 230,195 Q200,170 160,145',
    description: 'The elite NWC route to the rich Athabasca fur country.',
  },
  {
    id: 'nwc-peace',
    name: 'Peace River Route',
    company: 'NWC',
    yearStart: 1793,
    yearEnd: 1821,
    path: 'M160,145 Q130,160 100,180 Q80,200 60,220',
    description: 'Alexander Mackenzie\'s route to the Pacific, later a regular NWC path.',
  },
];

const timelineEvents = [
  { year: 1670, event: 'HBC Charter granted by King Charles II' },
  { year: 1717, event: 'Fort Churchill established' },
  { year: 1731, event: 'La Vérendrye reaches Lake Winnipeg' },
  { year: 1774, event: 'HBC builds Cumberland House - first inland post' },
  { year: 1779, event: 'North West Company formed in Montreal' },
  { year: 1788, event: 'NWC establishes Fort Chipewyan' },
  { year: 1793, event: 'Mackenzie reaches the Pacific' },
  { year: 1808, event: 'Simon Fraser descends the Fraser River' },
  { year: 1811, event: 'David Thompson maps the Columbia' },
  { year: 1816, event: 'Battle of Seven Oaks' },
  { year: 1821, event: 'HBC and NWC merge' },
  { year: 1870, event: 'HBC transfers Rupert\'s Land to Canada' },
];

export default function FurTradeMap() {
  const [selectedYear, setSelectedYear] = useState(1800);
  const [selectedPost, setSelectedPost] = useState<TradingPost | null>(null);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [showHBC, setShowHBC] = useState(true);
  const [showNWC, setShowNWC] = useState(true);

  // Filter posts and routes based on selected year
  const visiblePosts = useMemo(() => {
    return tradingPosts.filter(
      (post) =>
        post.yearEstablished <= selectedYear &&
        (!post.yearClosed || post.yearClosed >= selectedYear) &&
        ((post.company === 'HBC' && showHBC) ||
          (post.company === 'NWC' && showNWC) ||
          post.company === 'BOTH')
    );
  }, [selectedYear, showHBC, showNWC]);

  const visibleRoutes = useMemo(() => {
    return tradeRoutes.filter(
      (route) =>
        route.yearStart <= selectedYear &&
        route.yearEnd >= selectedYear &&
        ((route.company === 'HBC' && showHBC) || (route.company === 'NWC' && showNWC))
    );
  }, [selectedYear, showHBC, showNWC]);

  const currentEvent = useMemo(() => {
    const events = timelineEvents.filter((e) => e.year <= selectedYear);
    return events[events.length - 1];
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ice-block p-6">
        <h2 className="text-2xl font-bold text-[var(--evergreen)] mb-2">Fur Trade Network</h2>
        <p className="text-[var(--text-muted)]">
          Explore 200 years of the fur trade that shaped Canada - from the HBC charter to Confederation
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="ice-block p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Company Toggles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHBC(!showHBC)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    showHBC
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-600'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${showHBC ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                  <span className="font-semibold text-sm">HBC</span>
                </button>
                <button
                  onClick={() => setShowNWC(!showNWC)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    showNWC
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${showNWC ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                  <span className="font-semibold text-sm">NWC</span>
                </button>
              </div>

              {/* Year Display */}
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-[var(--evergreen)]">{selectedYear}</span>
              </div>
            </div>

            {/* Time Slider */}
            <div className="mt-4">
              <input
                type="range"
                min="1670"
                max="1870"
                step="1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--aurora-green) 0%, var(--accent-cyan) ${
                    ((selectedYear - 1670) / 200) * 100
                  }%, var(--frost-border) ${((selectedYear - 1670) / 200) * 100}%, var(--frost-border) 100%)`,
                }}
              />
              <div className="flex justify-between mt-1 text-xs text-[var(--text-muted)]">
                <span>1670</span>
                <span>1720</span>
                <span>1770</span>
                <span>1821</span>
                <span>1870</span>
              </div>
            </div>

            {/* Current Event */}
            {currentEvent && (
              <div className="mt-4 p-3 rounded-xl bg-[var(--aurora-green)]/10 border border-[var(--aurora-green)]/30">
                <p className="text-sm">
                  <span className="font-bold text-[var(--evergreen)]">{currentEvent.year}:</span>{' '}
                  <span className="text-[var(--text-secondary)]">{currentEvent.event}</span>
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="ice-block p-4 overflow-hidden">
            <div
              className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl"
              style={{ minHeight: '450px' }}
            >
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="fur-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#fur-grid)" />
                </svg>
              </div>

              {/* SVG Map */}
              <svg
                viewBox="0 0 500 400"
                className="w-full h-auto relative z-10"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0, 212, 170, 0.2))' }}
              >
                <defs>
                  {/* Glow filters */}
                  <filter id="hbc-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="nwc-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Animated dash */}
                  <linearGradient id="hbc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="nwc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Simplified North America Outline */}
                <path
                  d="M30,100 Q60,80 100,70 Q150,60 200,65 Q250,55 300,70 Q350,60 400,80 Q440,100 460,140
                     L470,200 Q460,250 440,290 Q420,320 380,340 Q340,360 300,365 Q260,370 220,360
                     Q180,350 140,330 Q100,310 70,280 Q40,250 30,200 Z"
                  fill="none"
                  stroke="var(--accent-cyan)"
                  strokeWidth="1.5"
                  opacity="0.3"
                />

                {/* Hudson Bay */}
                <path
                  d="M280,120 Q320,130 340,160 Q360,190 350,220 Q330,240 300,240 Q270,235 260,210 Q250,180 260,150 Q270,125 280,120"
                  fill="var(--accent-cyan)"
                  opacity="0.15"
                  stroke="var(--accent-cyan)"
                  strokeWidth="1"
                />

                {/* Great Lakes simplified */}
                <ellipse cx="370" cy="260" rx="30" ry="15" fill="var(--accent-cyan)" opacity="0.15" />
                <ellipse cx="340" cy="250" rx="20" ry="10" fill="var(--accent-cyan)" opacity="0.15" />

                {/* Trade Routes */}
                {visibleRoutes.map((route) => (
                  <path
                    key={route.id}
                    d={route.path}
                    fill="none"
                    stroke={route.company === 'HBC' ? 'url(#hbc-gradient)' : 'url(#nwc-gradient)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="8 4"
                    filter={route.company === 'HBC' ? 'url(#hbc-glow)' : 'url(#nwc-glow)'}
                    className="animate-pulse"
                    style={{ animationDuration: '3s' }}
                  />
                ))}

                {/* Trading Posts */}
                {visiblePosts.map((post) => {
                  const isSelected = selectedPost?.id === post.id;
                  const isHovered = hoveredPost === post.id;
                  const color =
                    post.company === 'HBC'
                      ? '#ef4444'
                      : post.company === 'NWC'
                      ? '#3b82f6'
                      : '#8b5cf6';

                  return (
                    <g key={post.id}>
                      {/* Pulse ring on hover/select */}
                      {(isSelected || isHovered) && (
                        <circle
                          cx={post.x}
                          cy={post.y}
                          r="15"
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}
                      {/* Post marker */}
                      <circle
                        cx={post.x}
                        cy={post.y}
                        r={isSelected || isHovered ? 10 : 7}
                        fill={color}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        filter={isSelected || isHovered ? 'url(#hbc-glow)' : ''}
                        onClick={() => setSelectedPost(post)}
                        onMouseEnter={() => setHoveredPost(post.id)}
                        onMouseLeave={() => setHoveredPost(null)}
                      />
                      {/* Label on hover */}
                      {isHovered && !isSelected && (
                        <text
                          x={post.x}
                          y={post.y - 15}
                          fill="white"
                          fontSize="10"
                          textAnchor="middle"
                          className="pointer-events-none"
                          style={{ textShadow: '0 0 5px rgba(0,0,0,0.8)' }}
                        >
                          {post.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Compass */}
                <g transform="translate(450, 50)">
                  <circle cx="0" cy="0" r="20" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" opacity="0.5" />
                  <text x="0" y="-25" fill="var(--accent-cyan)" fontSize="10" textAnchor="middle" opacity="0.7">
                    N
                  </text>
                  <polygon points="0,-15 -4,-5 4,-5" fill="var(--accent-cyan)" opacity="0.7" />
                </g>

                {/* Legend */}
                <g transform="translate(30, 350)">
                  <rect x="0" y="0" width="120" height="40" fill="rgba(0,0,0,0.5)" rx="5" />
                  <circle cx="15" cy="12" r="5" fill="#ef4444" />
                  <text x="25" y="16" fill="white" fontSize="9">
                    HBC Posts
                  </text>
                  <circle cx="15" cy="28" r="5" fill="#3b82f6" />
                  <text x="25" y="32" fill="white" fontSize="9">
                    NWC Posts
                  </text>
                  <circle cx="80" cy="12" r="5" fill="#8b5cf6" />
                  <text x="90" y="16" fill="white" fontSize="9">
                    Both
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1">
          {selectedPost ? (
            <div className="ice-block p-6 sticky top-4">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                      selectedPost.company === 'HBC'
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : selectedPost.company === 'NWC'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}
                  >
                    {selectedPost.company === 'BOTH' ? 'B' : selectedPost.company}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--evergreen)]">{selectedPost.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">Est. {selectedPost.yearEstablished}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-lg hover:bg-[var(--ice-blue)]/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Company Badge */}
              <div className="mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedPost.company === 'HBC'
                      ? 'bg-red-100 text-red-700'
                      : selectedPost.company === 'NWC'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {selectedPost.company === 'HBC'
                    ? "Hudson's Bay Company"
                    : selectedPost.company === 'NWC'
                    ? 'North West Company'
                    : 'Both Companies'}
                </span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedPost.description}</p>
              </div>

              {/* Significance */}
              <div className="p-4 rounded-xl bg-[var(--aurora-green)]/10 border border-[var(--aurora-green)]/30">
                <h4 className="font-semibold text-[var(--evergreen)] mb-2 flex items-center gap-2">
                  <span>💡</span> Historical Significance
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedPost.significance}</p>
              </div>

              {/* Date Info */}
              {selectedPost.yearClosed && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--ice-blue)]/30">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold">Active:</span> {selectedPost.yearEstablished} -{' '}
                    {selectedPost.yearClosed}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="ice-block p-6 text-center">
              <div className="text-4xl mb-4">🦫</div>
              <h3 className="font-bold text-[var(--evergreen)] mb-2">Select a Trading Post</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Click on any marker on the map to learn about that trading post
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-left">
                  <h4 className="font-semibold text-red-700 text-sm mb-1">Hudson&apos;s Bay Company (1670)</h4>
                  <p className="text-xs text-red-600">
                    British-chartered company that traded from posts on Hudson Bay, waiting for Indigenous peoples to
                    bring furs to them.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-left">
                  <h4 className="font-semibold text-blue-700 text-sm mb-1">North West Company (1779)</h4>
                  <p className="text-xs text-blue-600">
                    Montreal-based partnership of aggressive traders who traveled deep into the interior, competing
                    directly with the HBC.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="ice-block p-4 mt-4">
            <h4 className="font-semibold text-[var(--evergreen)] text-sm mb-3">In {selectedYear}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-red-50 text-center">
                <div className="text-xl font-bold text-red-600">
                  {visiblePosts.filter((p) => p.company === 'HBC').length}
                </div>
                <div className="text-xs text-red-500">HBC Posts</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {visiblePosts.filter((p) => p.company === 'NWC').length}
                </div>
                <div className="text-xs text-blue-500">NWC Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Footer */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">🛶</div>
          <div>
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">The Voyageur Era</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The fur trade was built on partnerships between European companies and Indigenous peoples, who provided
              essential knowledge, labor, and goods. Voyageurs - the canoe paddlers who transported furs and trade
              goods - became legendary for their endurance. The 1821 merger of the HBC and NWC ended an era of intense
              competition, and in 1870, the HBC transferred its vast territory to the new Dominion of Canada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
