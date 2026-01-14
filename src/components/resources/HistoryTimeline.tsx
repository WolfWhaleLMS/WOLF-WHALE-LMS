'use client';

import { useState } from 'react';

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  significance: string;
  color: string;
  icon: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 'time-immemorial',
    year: 'Time Immemorial',
    title: 'Indigenous Stewardship',
    shortDescription: 'Indigenous peoples have lived on and cared for Turtle Island since time beyond memory.',
    fullDescription: 'For thousands of years before European contact, Indigenous peoples developed complex societies, governance systems, trade networks, and sustainable relationships with the land. Diverse nations including the Cree, Dene, Blackfoot, Anishinaabe, Haudenosaunee, and many others established distinct cultures, languages, and traditions. This period represents tens of thousands of years of history, innovation, and stewardship.',
    significance: 'Understanding that Indigenous history did not begin with colonization is fundamental to reconciliation. Indigenous peoples were not "discovered" - they were sovereign nations with rich histories.',
    color: 'from-emerald-500 to-teal-500',
    icon: '🌲',
  },
  {
    id: 'royal-proclamation',
    year: '1763',
    title: 'Royal Proclamation',
    shortDescription: 'King George III recognizes Indigenous rights and establishes the foundation for treaty-making.',
    fullDescription: 'The Royal Proclamation of 1763 was issued by King George III after Britain acquired French territory in North America following the Seven Years\' War. It established the important principle that Indigenous peoples had rights to their lands until ceded to the Crown through treaties. It forbade settlers from claiming land directly and required the Crown to negotiate treaties with Indigenous nations.',
    significance: 'Often called the "Indian Magna Carta," this document established the legal basis for treaty relationships and recognized Indigenous peoples as nations with inherent rights. It remains constitutionally significant today.',
    color: 'from-amber-500 to-orange-500',
    icon: '📜',
  },
  {
    id: 'numbered-treaties',
    year: '1871-1921',
    title: 'The Numbered Treaties (1-11)',
    shortDescription: 'Eleven major treaties were signed between the Crown and First Nations across Western and Northern Canada.',
    fullDescription: 'Beginning in 1871 with Treaty 1 in Manitoba, the Crown entered into eleven major treaties covering much of Western and Northern Canada. Indigenous nations understood these as sacred agreements to share the land and live in peace. The treaties included promises of reserves, annuities, hunting and fishing rights, education, and assistance. Treaty 6 (1876) notably includes the "Medicine Chest" clause promising healthcare.',
    significance: 'Indigenous peoples view treaties as living documents establishing nation-to-nation relationships. Many treaty promises remain unfulfilled, and treaty rights are constitutionally protected under Section 35 of the Constitution Act, 1982.',
    color: 'from-cyan-500 to-blue-500',
    icon: '🤝',
  },
  {
    id: 'indian-act',
    year: '1876',
    title: 'The Indian Act',
    shortDescription: 'Canada passes the Indian Act, establishing government control over nearly every aspect of Indigenous life.',
    fullDescription: 'The Indian Act consolidated previous colonial laws and gave the federal government sweeping control over Indigenous peoples. It defined who could be legally recognized as "Indian," created the reserve system, banned traditional practices like potlatches and sun dances, restricted movement off reserves, and established the residential school system. The Act has been amended many times but remains in force today.',
    significance: 'The Indian Act represents a policy of assimilation - attempting to eliminate Indigenous identities, cultures, and governance. Understanding this legislation is crucial to understanding the systemic barriers Indigenous peoples continue to face.',
    color: 'from-red-500 to-rose-500',
    icon: '⚖️',
  },
  {
    id: 'northwest-resistance',
    year: '1885',
    title: 'Northwest Resistance',
    shortDescription: 'Métis and First Nations rise up against broken promises and encroachment on their lands.',
    fullDescription: 'Led by Louis Riel and Métis and First Nations leaders including Big Bear and Poundmaker, the Northwest Resistance was a response to the Canadian government\'s failure to address land claims, food shortages caused by the disappearance of the buffalo, and unfulfilled treaty promises. The resistance was suppressed by Canadian forces. Louis Riel was tried and executed for treason, while other leaders were imprisoned.',
    significance: 'Louis Riel is now recognized as a Father of Confederation for his role in bringing Manitoba into Canada. The events of 1885 highlight the consequences of broken promises and the ongoing struggle for Indigenous rights and recognition.',
    color: 'from-purple-500 to-violet-500',
    icon: '⚔️',
  },
  {
    id: 'residential-schools',
    year: '1880s-1996',
    title: 'Residential Schools',
    shortDescription: 'Over 150,000 Indigenous children were forcibly removed from their families and sent to church-run schools.',
    fullDescription: 'The residential school system was designed to "kill the Indian in the child." Children were taken from their families, forbidden from speaking their languages or practicing their cultures, and subjected to harsh discipline. Many experienced physical, sexual, and emotional abuse. Thousands of children died from disease, neglect, and abuse. The last federally-run school closed in 1996. The system operated for over a century, affecting multiple generations.',
    significance: 'The TRC documented the deaths of at least 4,100 children, though the true number is likely much higher. Survivors and intergenerational trauma continue to affect Indigenous communities today. Understanding this history is essential to reconciliation.',
    color: 'from-slate-600 to-gray-700',
    icon: '🏚️',
  },
  {
    id: 'sixties-scoop',
    year: '1960s-1980s',
    title: 'The Sixties Scoop',
    shortDescription: 'Thousands of Indigenous children were removed from their families and adopted into non-Indigenous homes.',
    fullDescription: 'Beginning in the 1960s and continuing into the 1980s, child welfare agencies removed an estimated 20,000 Indigenous children from their families and communities. Children were placed in foster care or adopted into predominantly white, middle-class families across Canada and internationally. Many lost connection to their cultures, languages, families, and identities. This practice has been recognized as a continuation of assimilation policies.',
    significance: 'The Sixties Scoop caused lasting trauma and disconnection. In 2017, the Ontario Superior Court ruled that the federal government had breached its duty of care. The legacy continues as Indigenous children remain overrepresented in the child welfare system today.',
    color: 'from-indigo-500 to-blue-600',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'constitution-act',
    year: '1982',
    title: 'Constitution Act - Section 35',
    shortDescription: 'Aboriginal and treaty rights are recognized and affirmed in Canada\'s Constitution.',
    fullDescription: 'Section 35 of the Constitution Act, 1982 recognizes and affirms the existing Aboriginal and treaty rights of the Indian, Inuit, and Métis peoples of Canada. This constitutional protection was achieved through significant advocacy by Indigenous leaders. While Section 35 provides important legal protections, the scope and meaning of these rights continue to be defined through court decisions and negotiations.',
    significance: 'Constitutional recognition provides a legal foundation for Indigenous rights claims and has led to important court decisions affirming rights to traditional territories, self-governance, and cultural practices.',
    color: 'from-green-500 to-emerald-500',
    icon: '📋',
  },
  {
    id: 'trc',
    year: '2008-2015',
    title: 'Truth and Reconciliation Commission',
    shortDescription: 'The TRC documents the history and impacts of residential schools and issues 94 Calls to Action.',
    fullDescription: 'The Truth and Reconciliation Commission was established as part of the Indian Residential Schools Settlement Agreement. Over six years, the TRC gathered statements from more than 7,000 survivors, documented the history of residential schools, and heard from communities across Canada. In 2015, the TRC released its final report, including 94 Calls to Action addressing education, child welfare, language and culture, health, justice, and many other areas.',
    significance: 'The TRC\'s Calls to Action provide a roadmap for reconciliation. They call on all Canadians - governments, institutions, businesses, and individuals - to take concrete steps toward healing and building new relationships based on mutual respect.',
    color: 'from-orange-500 to-amber-500',
    icon: '🕯️',
  },
  {
    id: 'mmiwg',
    year: '2019',
    title: 'MMIWG Inquiry',
    shortDescription: 'National inquiry concludes that violence against Indigenous women and girls is genocide.',
    fullDescription: 'The National Inquiry into Missing and Murdered Indigenous Women and Girls was launched in 2016 following decades of advocacy by Indigenous families and communities. The final report, released in 2019, concluded that Canada has committed genocide against Indigenous peoples, particularly Indigenous women, girls, and 2SLGBTQQIA+ people. The report included 231 Calls for Justice addressing root causes of violence.',
    significance: 'The use of the term "genocide" was significant and controversial. The inquiry highlighted the intersection of colonialism, racism, and gender-based violence, and called for transformative change in how Canada addresses violence against Indigenous peoples.',
    color: 'from-red-600 to-pink-600',
    icon: '❤️',
  },
  {
    id: 'kamloops',
    year: '2021',
    title: 'Tk\'emlúps te Secwépemc Discovery',
    shortDescription: 'Ground-penetrating radar confirms remains of 215 children at former Kamloops residential school.',
    fullDescription: 'In May 2021, Tk\'emlúps te Secwépemc First Nation announced that ground-penetrating radar had detected the remains of approximately 215 children buried at the former Kamloops Indian Residential School. This discovery prompted searches at other former residential school sites across Canada, revealing hundreds more potential unmarked graves. The discoveries brought renewed attention to the legacy of residential schools.',
    significance: 'While survivors and communities had long known about children who never came home, the discoveries brought national and international attention to the ongoing impacts of residential schools. They prompted calls for action on the TRC\'s recommendations, particularly around identifying and commemorating children who died.',
    color: 'from-gray-700 to-slate-800',
    icon: '🪶',
  },
  {
    id: 'present',
    year: 'Present Day',
    title: 'Ongoing Reconciliation',
    shortDescription: 'The journey toward reconciliation continues through education, action, and building new relationships.',
    fullDescription: 'Reconciliation is not a destination but an ongoing process. Indigenous peoples continue to advocate for their rights, revitalize their languages and cultures, and build strong communities. Progress has been made in areas like land claims, self-governance, and education, but significant work remains. All Canadians have a role to play in reconciliation - through learning, listening, and taking action.',
    significance: 'Every Canadian can contribute to reconciliation by learning about Indigenous histories, supporting Indigenous-led initiatives, respecting treaty rights, and working toward a more just and equitable society.',
    color: 'from-teal-500 to-cyan-500',
    icon: '🌅',
  },
];

export default function HistoryTimeline() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const toggleEvent = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ice-block p-6">
        <h2 className="text-2xl font-bold text-[var(--evergreen)] mb-2">Canadian History Timeline</h2>
        <p className="text-[var(--text-muted)]">
          Click on any event to learn more about its significance in Indigenous-Canadian history
        </p>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Central Timeline Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--aurora-green)] via-[var(--accent-cyan)] to-[var(--evergreen)] transform md:-translate-x-1/2 rounded-full"></div>

        {/* Timeline Events */}
        <div className="space-y-8 relative">
          {timelineEvents.map((event, index) => (
            <div
              key={event.id}
              className={`relative flex items-start gap-4 md:gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Node */}
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={() => toggleEvent(event.id)}
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center text-2xl shadow-lg border-4 border-white/50 hover:scale-110 transition-transform cursor-pointer`}
                  style={{ boxShadow: `0 0 20px rgba(0,212,170,0.3)` }}
                >
                  {event.icon}
                </button>
              </div>

              {/* Content Card */}
              <div
                className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                  index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                }`}
              >
                <div
                  className={`ice-block p-5 cursor-pointer transition-all duration-300 ${
                    expandedEvent === event.id
                      ? 'ring-2 ring-[var(--aurora-green)] shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleEvent(event.id)}
                >
                  {/* Year Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${event.color} text-white text-sm font-bold`}>
                      {event.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[var(--evergreen)] mb-2">{event.title}</h3>

                  {/* Short Description */}
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {event.shortDescription}
                  </p>

                  {/* Expand Indicator */}
                  <div className="flex items-center gap-2 mt-3 text-[var(--aurora-green)] text-sm font-medium">
                    <span>{expandedEvent === event.id ? 'Click to collapse' : 'Click to learn more'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedEvent === event.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Expanded Content */}
                  {expandedEvent === event.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--frost-border)] space-y-4 animate-fadeIn">
                      <div>
                        <h4 className="font-semibold text-[var(--evergreen)] mb-2 flex items-center gap-2">
                          <span className="text-lg">📖</span>
                          Full Context
                        </h4>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                          {event.fullDescription}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--aurora-green)]/10 border border-[var(--aurora-green)]/30">
                        <h4 className="font-semibold text-[var(--evergreen)] mb-2 flex items-center gap-2">
                          <span className="text-lg">💡</span>
                          Why This Matters
                        </h4>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                          {event.significance}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spacer for alternating layout */}
              <div className="hidden md:block md:w-[calc(50%-4rem)]"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="glass-card p-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="text-2xl">📚</div>
          <div>
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">Continue Learning</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              This timeline provides an overview of key events but is not comprehensive. We encourage you to explore
              the resources provided by Indigenous communities, the National Centre for Truth and Reconciliation,
              and local cultural organizations to deepen your understanding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
