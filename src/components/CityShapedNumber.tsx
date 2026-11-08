import React from 'react';

interface CityShapedNumberProps {
  level: number; // 1 to 10
  isUnlocked?: boolean;
  isConquered?: boolean;
  size?: number;
  className?: string;
}

export const CityShapedNumber: React.FC<CityShapedNumberProps> = ({
  level,
  isUnlocked = true,
  isConquered = false,
  size = 72,
  className = '',
}) => {
  // Color palette based on status
  const goldPrimary = isConquered ? '#34d399' : isUnlocked ? '#fbbf24' : '#71717a';
  const goldSecondary = isConquered ? '#059669' : isUnlocked ? '#d97706' : '#3f3f46';
  const fillAccent = isConquered ? '#064e3b' : isUnlocked ? '#78350f' : '#18181b';
  const strokeColor = isConquered ? '#a7f3d0' : isUnlocked ? '#fef08a' : '#52525b';
  const glowFilter = isConquered ? 'url(#greenGlow)' : isUnlocked ? 'url(#goldGlow)' : 'none';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={`grad_${level}_${isUnlocked}_${isConquered}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={goldPrimary} />
            <stop offset="60%" stopColor={goldSecondary} />
            <stop offset="100%" stopColor={fillAccent} />
          </linearGradient>
        </defs>

        {/* Level 1: Pine Hollow - Frontier Timber Cabin & Pine Watchtower 1 */}
        {level === 1 && (
          <g filter={glowFilter}>
            {/* Base foundation logs */}
            <rect x="25" y="82" width="50" height="10" rx="3" fill={`url(#grad_1_${isUnlocked}_${isConquered})`} stroke={strokeColor} strokeWidth="1.5" />
            {/* Wooden watchtower shaft forming vertical stem */}
            <path
              d="M 43 82 L 43 32 L 35 38 L 30 30 L 48 14 L 57 14 L 57 82 Z"
              fill={`url(#grad_1_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Cabin roof peak on top of 1 */}
            <polygon points="48,10 57,10 65,16 57,20 48,16" fill={strokeColor} opacity="0.8" />
            {/* Timber log horizontal cuts */}
            <line x1="43" y1="44" x2="57" y2="44" stroke="#000" strokeWidth="1" opacity="0.4" />
            <line x1="43" y1="56" x2="57" y2="56" stroke="#000" strokeWidth="1" opacity="0.4" />
            <line x1="43" y1="68" x2="57" y2="68" stroke="#000" strokeWidth="1" opacity="0.4" />
            {/* Pine boughs on left & right */}
            <path d="M 28 34 L 20 42 L 32 40 Z" fill={isConquered ? '#10b981' : isUnlocked ? '#15803d' : '#27272a'} />
            <path d="M 58 48 L 70 42 L 58 54 Z" fill={isConquered ? '#10b981' : isUnlocked ? '#15803d' : '#27272a'} />
            <path d="M 58 64 L 68 58 L 58 70 Z" fill={isConquered ? '#10b981' : isUnlocked ? '#15803d' : '#27272a'} />
          </g>
        )}

        {/* Level 2: Riverbend - Arched Wooden River Bridge & River Steamboat 2 */}
        {level === 2 && (
          <g filter={glowFilter}>
            {/* Sweeping bridge arch forming head & body of 2 */}
            <path
              d="M 28 32 C 28 16, 72 16, 72 35 C 72 50, 48 62, 32 74 L 75 74 L 75 86 L 24 86 C 24 74, 46 60, 58 48 C 64 42, 63 28, 50 28 C 40 28, 36 34, 34 38 Z"
              fill={`url(#grad_2_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* River water waves under the bridge base */}
            <path d="M 20 90 Q 32 86, 44 90 T 68 90 T 85 90" fill="none" stroke={strokeColor} strokeWidth="2" opacity="0.7" />
            {/* Bridge suspension struts across top arch */}
            <line x1="38" y1="22" x2="38" y2="34" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="50" y1="18" x2="50" y2="30" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            <line x1="62" y1="22" x2="62" y2="36" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
            {/* Steamboat paddlewheel accent */}
            <circle cx="70" cy="74" r="5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>
        )}

        {/* Level 3: Maple Crossing - Dual-Tiered Brick Clocktower & Market Exchange 3 */}
        {level === 3 && (
          <g filter={glowFilter}>
            {/* Double-arched market clocktower forming numeral 3 */}
            <path
              d="M 28 22 C 28 12, 68 10, 68 28 C 68 40, 54 44, 46 46 C 58 48, 72 54, 72 70 C 72 88, 30 88, 26 74 L 38 71 C 41 80, 58 80, 58 70 C 58 60, 44 58, 36 58 L 36 46 C 44 46, 54 44, 54 30 C 54 22, 40 22, 36 26 Z"
              fill={`url(#grad_3_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Clocktower dial face in top loop */}
            <circle cx="48" cy="28" r="4" fill="#000" opacity="0.5" stroke={strokeColor} strokeWidth="1" />
            {/* Market awning brick tiers */}
            <rect x="33" y="50" width="10" height="3" fill={strokeColor} opacity="0.6" />
            {/* Maple leaf accent */}
            <path d="M 72 46 L 78 40 L 76 48 L 84 50 L 76 54 L 78 62 L 72 56 Z" fill={isConquered ? '#34d399' : '#f97316'} opacity="0.8" />
          </g>
        )}

        {/* Level 4: Iron Junction - Steam Locomotive Depot & Iron Truss Bridge 4 */}
        {level === 4 && (
          <g filter={glowFilter}>
            {/* Railroad depot truss frame forming numeral 4 */}
            <path
              d="M 56 12 L 20 62 L 20 70 L 56 70 L 56 86 L 68 86 L 68 70 L 80 70 L 80 58 L 68 58 L 68 12 Z M 56 28 L 56 58 L 34 58 Z"
              fill={`url(#grad_4_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Iron truss cross-bracing in triangular window */}
            <line x1="36" y1="56" x2="54" y2="32" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />
            <line x1="38" y1="36" x2="54" y2="54" stroke={strokeColor} strokeWidth="1.2" opacity="0.6" />
            {/* Locomotive smokestack steam clouds top */}
            <circle cx="68" cy="8" r="4" fill={strokeColor} opacity="0.5" />
            <circle cx="74" cy="5" r="3" fill={strokeColor} opacity="0.3" />
            {/* Rail track ties across bottom horizontal bar */}
            <line x1="28" y1="62" x2="28" y2="68" stroke="#000" strokeWidth="1.5" opacity="0.5" />
            <line x1="42" y1="62" x2="42" y2="68" stroke="#000" strokeWidth="1.5" opacity="0.5" />
            <line x1="74" y1="62" x2="74" y2="68" stroke="#000" strokeWidth="1.5" opacity="0.5" />
          </g>
        )}

        {/* Level 5: Lakeview - Lakeside Resort Hotel, Lighthouse & Marina Hook 5 */}
        {level === 5 && (
          <g filter={glowFilter}>
            {/* Lakeside promenade hotel & harbor hook forming 5 */}
            <path
              d="M 30 16 L 75 16 L 75 28 L 44 28 L 41 44 C 47 41, 72 40, 72 63 C 72 82, 48 86, 28 80 L 30 68 C 42 74, 58 72, 58 62 C 58 52, 44 50, 34 52 L 28 42 Z"
              fill={`url(#grad_5_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Lighthouse beacon atop top horizontal bar */}
            <polygon points="70,16 75,8 80,16" fill={strokeColor} opacity="0.8" />
            <circle cx="75" cy="11" r="2" fill="#fff" />
            {/* Hotel resort window arcade */}
            <line x1="48" y1="21" x2="48" y2="25" stroke="#000" strokeWidth="1.5" opacity="0.5" />
            <line x1="56" y1="21" x2="56" y2="25" stroke="#000" strokeWidth="1.5" opacity="0.5" />
            <line x1="64" y1="21" x2="64" y2="25" stroke="#000" strokeWidth="1.5" opacity="0.5" />
            {/* Gentle marina water rippling */}
            <path d="M 22 84 Q 30 80, 38 84" fill="none" stroke={strokeColor} strokeWidth="1.5" opacity="0.6" />
          </g>
        )}

        {/* Level 6: Fairhaven - Carnival Ferris Wheel & Circus Big-Top Pavilion 6 */}
        {level === 6 && (
          <g filter={glowFilter}>
            {/* High-striker carnival spire descending into Ferris Wheel loop */}
            <path
              d="M 64 16 L 52 20 C 36 28, 26 44, 26 62 C 26 78, 38 88, 54 88 C 70 88, 78 76, 78 62 C 78 46, 66 38, 52 38 C 40 38, 34 46, 32 52 C 34 42, 44 32, 58 26 L 68 22 Z M 52 50 C 62 50, 66 56, 66 62 C 66 70, 60 76, 52 76 C 44 76, 38 70, 38 62 C 38 54, 44 50, 52 50 Z"
              fill={`url(#grad_6_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Ferris wheel spokes inside loop */}
            <circle cx="52" cy="62" r="3" fill={strokeColor} />
            <line x1="52" y1="53" x2="52" y2="71" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
            <line x1="43" y1="62" x2="61" y2="62" stroke={strokeColor} strokeWidth="1" opacity="0.6" />
            {/* Carnival pennant banner atop 6 */}
            <polygon points="68,22 76,16 70,24" fill={isConquered ? '#34d399' : '#f43f5e'} />
          </g>
        )}

        {/* Level 7: Old Crown - Ancient Gothic Stone Fortress & Card Citadel 7 */}
        {level === 7 && (
          <g filter={glowFilter}>
            {/* Castle battlement top & diagonal fortress wall */}
            <path
              d="M 22 18 L 78 18 L 78 28 L 52 86 L 38 86 L 62 30 L 22 30 Z"
              fill={`url(#grad_7_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Castle battlements / merlons atop top horizontal bar */}
            <rect x="26" y="12" width="6" height="6" fill={strokeColor} />
            <rect x="42" y="12" width="6" height="6" fill={strokeColor} />
            <rect x="58" y="12" width="6" height="6" fill={strokeColor} />
            <rect x="72" y="12" width="6" height="6" fill={strokeColor} />
            {/* Stone brick masonry line etchings */}
            <line x1="48" y1="44" x2="58" y2="44" stroke="#000" strokeWidth="1" opacity="0.4" />
            <line x1="44" y1="58" x2="54" y2="58" stroke="#000" strokeWidth="1" opacity="0.4" />
            <line x1="40" y1="72" x2="50" y2="72" stroke="#000" strokeWidth="1" opacity="0.4" />
            {/* Citadel arrow slit */}
            <rect x="48" y="48" width="2" height="6" rx="1" fill="#000" opacity="0.6" />
          </g>
        )}

        {/* Level 8: Kingsport - Art-Deco Twin Skyscrapers & High-Roller Skybridge 8 */}
        {level === 8 && (
          <g filter={glowFilter}>
            {/* Twin stacked skyscraper loops forming 8 */}
            <path
              d="M 50 14 C 36 14, 28 24, 28 34 C 28 44, 38 48, 44 50 C 34 52, 24 60, 24 72 C 24 84, 36 90, 50 90 C 64 90, 76 84, 76 72 C 76 60, 66 52, 56 50 C 62 48, 72 44, 72 34 C 72 24, 64 14, 50 14 Z M 50 24 C 58 24, 62 28, 62 34 C 62 40, 56 44, 50 44 C 44 44, 38 40, 38 34 C 38 28, 42 24, 50 24 Z M 50 56 C 58 56, 64 62, 64 72 C 64 80, 58 82, 50 82 C 42 82, 36 80, 36 72 C 36 62, 42 56, 50 56 Z"
              fill={`url(#grad_8_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Art-Deco skyscraper spire atop 8 */}
            <line x1="50" y1="4" x2="50" y2="14" stroke={strokeColor} strokeWidth="2" />
            <polygon points="46,14 50,6 54,14" fill={strokeColor} />
            {/* Illuminated glass window vertical lines */}
            <line x1="45" y1="28" x2="45" y2="40" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
            <line x1="55" y1="28" x2="55" y2="40" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
            <line x1="44" y1="62" x2="44" y2="76" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
            <line x1="56" y1="62" x2="56" y2="76" stroke={strokeColor} strokeWidth="1" opacity="0.4" />
          </g>
        )}

        {/* Level 9: Grand Club City - Colossal Championship Arena Stadium & Spire 9 */}
        {level === 9 && (
          <g filter={glowFilter}>
            {/* Stadium arena bowl looping down into sweeping exit ramp */}
            <path
              d="M 50 12 C 34 12, 24 24, 24 38 C 24 54, 36 62, 50 62 C 62 62, 68 54, 70 48 C 68 58, 58 68, 44 74 L 38 80 L 48 86 C 66 78, 76 64, 76 38 C 76 22, 66 12, 50 12 Z M 50 24 C 58 24, 64 30, 64 38 C 64 46, 58 50, 50 50 C 42 50, 36 46, 36 38 C 36 30, 42 24, 50 24 Z"
              fill={`url(#grad_9_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Arena stadium floodlight towers */}
            <circle cx="30" cy="18" r="2.5" fill="#fff" />
            <circle cx="70" cy="18" r="2.5" fill="#fff" />
            {/* Broadcast antenna spire atop stadium dome */}
            <line x1="50" y1="4" x2="50" y2="12" stroke={strokeColor} strokeWidth="2" />
            <circle cx="50" cy="3" r="2" fill={strokeColor} />
            {/* Spectator tiered grandstand lines in loop */}
            <circle cx="50" cy="38" r="7" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          </g>
        )}

        {/* Level 10: Crown Capital - Imperial Triumphal Column & Golden Sovereign Crown Palace 10 */}
        {level === 10 && (
          <g filter={glowFilter}>
            {/* The '1' as the Imperial Monumental Obelisk */}
            <path
              d="M 24 84 L 14 84 L 14 76 L 22 76 L 22 28 L 14 34 L 10 26 L 24 16 L 32 16 L 32 76 L 40 76 L 40 84 Z"
              fill={`url(#grad_10_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* The '0' as the Grand Sovereign Imperial Crown Dome */}
            <path
              d="M 68 18 C 50 18, 44 32, 44 52 C 44 72, 50 86, 68 86 C 86 86, 92 72, 92 52 C 92 32, 86 18, 68 18 Z M 68 30 C 76 30, 78 40, 78 52 C 78 64, 76 74, 68 74 C 60 74, 58 64, 58 52 C 58 40, 60 30, 68 30 Z"
              fill={`url(#grad_10_${isUnlocked}_${isConquered})`}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Imperial Sovereign 5-point Crown atop the '0' */}
            <polygon
              points="56,18 60,6 64,14 68,4 72,14 76,6 80,18"
              fill={isConquered ? '#34d399' : '#fbbf24'}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            {/* Star jewels atop crown points */}
            <circle cx="68" cy="4" r="1.5" fill="#fff" />
            <circle cx="60" cy="6" r="1.2" fill="#fff" />
            <circle cx="76" cy="6" r="1.2" fill="#fff" />
          </g>
        )}
      </svg>
    </div>
  );
};
