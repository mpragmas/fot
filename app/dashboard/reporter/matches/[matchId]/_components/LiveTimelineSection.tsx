import React from 'react';

// --- Icons (Inline SVGs to ensure zero external dependencies for this snippet) ---

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

// --- Components ---

interface TimelineItemProps {
  side: 'left' | 'right';
  type: 'goal' | 'card';
  title: string;
  subtitle: string;
  showActions?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ side, type, title, subtitle, showActions = true }) => {
  const isRight = side === 'right';

  // Icon Logic
  let IconComponent;
  let iconBgColor;
  let iconColor;

  if (type === 'goal') {
    IconComponent = CheckIcon;
    iconBgColor = 'bg-green-100'; // Light green circle
    iconColor = 'text-green-500';  // Darker green check
  } else {
    // Yellow card representation
    IconComponent = () => <div className="w-3 h-4 bg-yellow-400 rounded-[1px]" />; 
    iconBgColor = 'bg-yellow-100';
    iconColor = ''; 
  }

  return (
    <div className={`flex items-center w-full mb-8 relative ${isRight ? 'justify-start' : 'justify-end'}`}>
      
      {/* The Content Container */}
      <div className={`w-1/2 flex items-center ${isRight ? 'pl-12 flex-row' : 'pr-12 flex-row-reverse text-right'}`}>
        
        {/* Center Dot/Icon Indicator - Absolute positioned on the line */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full ${iconBgColor}`}>
          <div className={iconColor}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 text-sm md:text-base">{title}</h4>
          <p className="text-gray-400 text-xs md:text-sm mt-1">{subtitle}</p>
        </div>

        {/* Action Buttons (Edit/Delete) */}
        {showActions && (
          <div className={`flex items-center gap-3 ${isRight ? 'ml-4' : 'mr-4'}`}>
             {/* Order swaps based on side to match image */}
             {isRight ? (
                <>
                  <button className="text-blue-400 hover:text-blue-600 transition-colors">
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button className="text-red-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </>
             ) : (
                <>
                  <button className="text-red-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <button className="text-blue-400 hover:text-blue-600 transition-colors">
                    <EditIcon className="w-4 h-4" />
                  </button>
                </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-center">
      {label && <span className="text-slate-500 font-semibold text-sm mb-2 block">{label}</span>}
      <span className="text-slate-700 font-bold text-lg">{value}</span>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function MatchDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans flex flex-col lg:flex-row gap-6 items-start justify-center">
      
      {/* Left Section: Live Timeline */}
      <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm p-6 md:p-8 relative">
        <h2 className="text-xl font-bold text-gray-800 mb-10">Live Timeline</h2>

        <div className="relative">
          {/* Vertical Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 transform" />

          {/* Timeline Group 1 */}
          <div className="relative z-0">
            <TimelineItem 
              side="right" 
              type="goal" 
              title="Goal by Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
            <TimelineItem 
              side="right" 
              type="card" 
              title="Yellow Card for Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
            <TimelineItem 
              side="left" 
              type="goal" 
              title="Goal by Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
          </div>

          {/* Horizontal Divider */}
          <div className="relative z-10 bg-white py-4">
             <hr className="border-t-2 border-slate-200 w-full" />
          </div>

          {/* Timeline Group 2 (Duplicate for visual match) */}
          <div className="relative z-0 mt-4">
             <TimelineItem 
              side="right" 
              type="goal" 
              title="Goal by Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
            <TimelineItem 
              side="right" 
              type="card" 
              title="Yellow Card for Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
            <TimelineItem 
              side="left" 
              type="goal" 
              title="Goal by Kevin De Bruyne" 
              subtitle="25'Assist by E. Haaland" 
            />
          </div>
        </div>
      </div>

      {/* Right Section: Stats */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Stats</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Shots APR" value="0" />
          <StatCard label="Shots RAY" value="0" />
          
          <StatCard label="Corner APR" value="0" />
          <StatCard label="Corner RAY" value="0" />
          
          {/* The bottom two inputs in the image appear to have placeholder style or empty labels */}
          <div className="col-span-1">
             <StatCard label="" value="0" />
          </div>
           <div className="col-span-1">
             <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-center h-full">
                <span className="text-slate-500 font-semibold text-sm mb-2 block">Shots</span>
                <span className="text-slate-700 font-bold text-lg">0</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}