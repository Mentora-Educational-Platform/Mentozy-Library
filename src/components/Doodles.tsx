import React from 'react';

export const BeeDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-black ${className}`}>
      <ellipse cx="50" cy="50" rx="20" ry="15" fill="#fde047" />
      <path d="M 40 37 Q 45 50 40 63" />
      <path d="M 50 35 Q 55 50 50 65" />
      <path d="M 60 37 Q 65 50 60 63" />
      <path d="M 45 35 Q 30 10 50 20 Q 60 30 55 35" fill="#fff" strokeWidth="2" />
      <path d="M 55 35 Q 70 10 50 20" fill="#fff" strokeWidth="2" />
      <circle cx="30" cy="50" r="8" fill="#fff" />
      <path d="M 25 45 Q 20 30 15 35" />
      <path d="M 28 43 Q 25 25 20 28" />
      <circle cx="28" cy="48" r="1.5" fill="currentColor" />
      <path d="M 70 50 L 80 50" />
  </svg>
);

export const CatDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-black ${className}`}>
      <path d="M 20 60 Q 50 30 80 60" fill="#f3f4f6" />
      <path d="M 20 60 Q 50 70 80 60" fill="#f3f4f6" />
      <circle cx="25" cy="50" r="14" fill="#f3f4f6" />
      <path d="M 15 45 L 10 25 L 25 40" fill="#f3f4f6" />
      <path d="M 25 40 L 35 25 L 35 45" fill="#f3f4f6" />
      <path d="M 80 60 Q 95 60 90 35" />
      <path d="M 18 52 Q 21 55 24 52" />
      <path d="M 28 52 Q 31 55 34 52" />
      <path d="M 26 56 L 27 57 L 25 57 Z" fill="currentColor" />
  </svg>
);

export const StarDoodle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-black ${className}`}>
      <path d="M 50 10 Q 55 45 90 50 Q 55 55 50 90 Q 45 55 10 50 Q 45 45 50 10 Z" fill="#fef08a" />
  </svg>
);

export const BookLogo = ({ className = "" }: { className?: string }) => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 28C16 28 20 30 20 30V16C20 16 16 12 8 12V28Z" fill="#bbf7d0" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 28C24 28 20 30 20 30V16C20 16 24 12 32 12V28Z" fill="#ffffff" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const doodleBorder = "border-[2.5px] border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px]";
export const doodleShadow = "shadow-[4px_4px_0px_#000]";
export const doodleHover = "hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200";

export const pastelColors = ['bg-[#fbcfe8]', 'bg-[#bfdbfe]', 'bg-[#fef08a]', 'bg-[#bbf7d0]', 'bg-[#e9d5ff]', 'bg-[#fed7aa]'];
export const getPastelColor = (index: number) => pastelColors[index % pastelColors.length];
