import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        {/* Deep Navy Gradient */}
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Brushed Copper-Bronze Gradient */}
        <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A059" />
          <stop offset="50%" stopColor="#8C6E54" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>

        {/* Dark Bronze for Border */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A3728" />
          <stop offset="100%" stopColor="#2D1F16" />
        </linearGradient>

        <filter id="logoSmoothShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#logoSmoothShadow)">
        {/* Stylized 'N' - Split Colors */}
        {/* Left Side: Navy Vertical + Half Diagonal */}
        <path
          d="M30 70V30L50 50"
          stroke="url(#navyGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Side: Copper-Bronze Half Diagonal + Vertical */}
        <path
          d="M50 50L70 70V30"
          stroke="url(#bronzeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />



        {/* Map Pins */}
        {/* Start Pin */}
        <g transform="translate(20, 75) scale(0.6)">
          <path
            d="M0 -10C-5.5 -10 -10 -5.5 -10 0C-10 8 0 16 0 16C0 16 10 8 10 0C10 -5.5 5.5 -10 0 -10ZM0 3C-1.7 3 -3 1.7 -3 0C-3 -1.7 -1.7 -3 0 -3C1.7 -3 3 -1.7 3 0C3 1.7 1.7 3 0 3Z"
            fill="url(#navyGrad)"
          />
        </g>
        {/* End Pin */}
        <g transform="translate(80, 25) scale(0.6)">
          <path
            d="M0 -10C-5.5 -10 -10 -5.5 -10 0C-10 8 0 16 0 16C0 16 10 8 10 0C10 -5.5 5.5 -10 0 -10ZM0 3C-1.7 3 -3 1.7 -3 0C-3 -1.7 -1.7 -3 0 -3C1.7 -3 3 -1.7 3 0C3 1.7 1.7 3 0 3Z"
            fill="url(#bronzeGrad)"
          />
        </g>

        {/* Stylized Plane at the end of the route */}
        <g transform="translate(80, 25) rotate(70)">
          <path
             d="M-5 -4 L5 0 L-5 4 L-3 0 Z"
             fill="url(#navyGrad)"
          />
        </g>

        {/* Compass Rose Overlay - Centered on N */}
        <g transform="translate(50, 50)">
          {/* Main vertical needle - Long and Sharp */}
          <path d="M0 -18L2 0L0 18L-2 0Z" fill="url(#navyGrad)" />
          {/* Horizontal needle */}
          <path d="M-10 0L0 -1.5L10 0L0 1.5Z" fill="url(#bronzeGrad)" />
          
          {/* Center Point */}
          <circle cx="0" cy="0" r="1" fill="white" />
        </g>
      </g>
    </svg>
  );
};

export default Logo;
