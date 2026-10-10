import React from 'react';

interface UrbanPriorityLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * Pixel-accurate vector recreation of the official Urban Priority logo:
 * - 5 modern skyscraper buildings with windows and antenna
 * - Glowing vibrant cyan-blue location pin with white checkmark
 * - Sleek curved blue horizon arc
 * - Bold 'Urban Priority' typography (white + cyan-blue)
 */
export const UrbanPriorityLogo: React.FC<UrbanPriorityLogoProps> = ({
  className = '',
  size = 40,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {/* Blue pin gradient */}
          <linearGradient id="pinGradient" x1="100" y1="65" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0099FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>

          {/* Glowing arc gradient */}
          <linearGradient id="arcGradient" x1="30" y1="105" x2="170" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
            <stop offset="25%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#60A5FA" />
            <stop offset="75%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
          </linearGradient>

          {/* Building subtle shadows */}
          <linearGradient id="bldgShadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>

        {/* --- SKYLINE BUILDINGS --- */}
        {/* Building 1 (Far Left small) */}
        <path d="M52 75H64V98H52V75Z" fill="#F8FAFC" />
        <rect x="55" y="79" width="3" height="3" rx="0.5" fill="#0F172A" />
        <rect x="55" y="85" width="3" height="3" rx="0.5" fill="#0F172A" />
        <rect x="55" y="91" width="3" height="3" rx="0.5" fill="#0F172A" />

        {/* Building 2 (Mid Left) */}
        <path d="M67 58H82V96H67V58Z" fill="#FFFFFF" />
        <rect x="71" y="63" width="4" height="4" rx="0.8" fill="#0F172A" />
        <rect x="71" y="71" width="4" height="4" rx="0.8" fill="#0F172A" />
        <rect x="71" y="79" width="4" height="4" rx="0.8" fill="#0F172A" />
        <rect x="71" y="87" width="4" height="4" rx="0.8" fill="#0F172A" />

        {/* Building 3 (Tall Center with antenna and angled roof) */}
        {/* Antenna */}
        <line x1="100" y1="27" x2="100" y2="38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="86,47 100,38 114,47 114,95 86,95" fill="#FFFFFF" />
        {/* Center windows */}
        <rect x="91" y="52" width="6" height="3" rx="0.5" fill="#0F172A" />
        <rect x="91" y="58" width="6" height="3" rx="0.5" fill="#0F172A" />
        <rect x="91" y="64" width="6" height="3" rx="0.5" fill="#0F172A" />
        <rect x="103" y="52" width="6" height="3" rx="0.5" fill="#0F172A" />
        <rect x="103" y="58" width="6" height="3" rx="0.5" fill="#0F172A" />
        <rect x="103" y="64" width="6" height="3" rx="0.5" fill="#0F172A" />

        {/* Building 4 (Mid Right angled perspective) */}
        <polygon points="118,52 131,58 131,97 118,97" fill="#E2E8F0" />
        <rect x="122" y="64" width="4" height="4" rx="0.8" fill="#0F172A" />
        <rect x="122" y="72" width="4" height="4" rx="0.8" fill="#0F172A" />
        <rect x="122" y="80" width="4" height="4" rx="0.8" fill="#0F172A" />

        {/* Building 5 (Far Right angled perspective) */}
        <polygon points="135,67 146,71 146,98 135,98" fill="#CBD5E1" />

        {/* --- CURVED HORIZON SWOOP ARC --- */}
        <path
          d="M32 105C55 96 145 96 168 105C140 99 60 99 32 105Z"
          fill="url(#arcGradient)"
          filter="drop-shadow(0 0 4px #00A3FF)"
        />

        {/* --- MAP PIN WITH CHECKMARK --- */}
        {/* Location Pin Shape */}
        <path
          d="M100 66C91.7 66 85 72.7 85 81C85 91.5 100 108 100 108C100 108 115 91.5 115 81C115 72.7 108.3 66 100 66Z"
          fill="url(#pinGradient)"
          filter="drop-shadow(0 2px 8px rgba(0, 163, 255, 0.6))"
        />

        {/* Inner Dark Circle */}
        <circle cx="100" cy="80.5" r="7.5" fill="#060D1A" />

        {/* Checkmark in center */}
        <path
          d="M96 80.5L98.8 83.2L104.2 77.8"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional integrated typography (matches the uploaded image text) */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-base tracking-tight text-white uppercase">
            Urban
          </span>
          <span className="font-extrabold text-base tracking-tight text-cyan-400 uppercase -mt-1">
            Priority
          </span>
        </div>
      )}
    </div>
  );
};
