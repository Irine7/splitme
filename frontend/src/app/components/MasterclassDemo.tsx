import React from 'react';
import Image from 'next/image';

export default function MasterclassDemo() {
  return (
    <div className="dark min-h-screen flex items-center justify-center p-8">
      <div className="relative max-w-3xl mx-auto">
        {/* Background wave effect - optional */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,800 C 0,800 200,600 600,600 C 1000,600 1200,800 1200,800 Z"
              fill="#222"
            />
          </svg>
        </div>
        
        <div className="flex flex-col items-center text-center">
          {/* 3D Object (Rocket) */}
          <div className="object-3d mb-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
              {/* Replace with actual rocket image */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-12 h-12 text-gray-400"
              >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="masterclass-title">Мастер-класс</h2>
          
          {/* Subtitle */}
          <h1 className="masterclass-subtitle">Чистая архитектура<br />React & Next.js</h1>
          
          {/* Date */}
          <div className="event-date">
            <span className="event-date-icon">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </span>
            10 августа в 10:00 МСК
          </div>
          
          {/* Footer */}
          <p className="event-footer">
            Исходники и запись остаются навсегда
          </p>
        </div>
      </div>
    </div>
  );
}
