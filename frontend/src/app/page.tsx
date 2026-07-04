'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';

// Lazy load R3F to prevent heavy initial bundle
const Hero3D = dynamic(() => import('@/components/features/Hero3D'), { ssr: false });
const CitizenFlow = dynamic(() => import('@/features/citizen/CitizenFlow'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background video slow zoom effect on scroll
      gsap.to(videoRef.current, {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

      // Hero text fade out on scroll
      gsap.to(heroTextRef.current, {
        y: 100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-[200vh] bg-neo-bg">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-neo-border">
        {/* Placeholder video element */}
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full opacity-60"
        >
          {/* <source src="/videos/hero-bg.mp4" type="video/mp4" /> */}
        </video>
        <div className="absolute inset-0 bg-neo-border/40 mix-blend-multiply" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <Hero3D />
        <div ref={heroTextRef} className="relative z-20 text-center max-w-4xl mx-auto space-y-8 pointer-events-none">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-neo-surface drop-shadow-md">
            Jan-Setu
          </h1>
          <p className="text-2xl md:text-4xl font-medium text-neo-surface/90 max-w-2xl mx-auto leading-tight">
            AI that helps governments decide what communities actually need.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pointer-events-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-xl"
              onClick={() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Report an Issue
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-xl bg-transparent text-neo-surface border-neo-surface hover:bg-neo-surface hover:text-neo-text">
              Explore Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content below fold */}
      <div className="relative z-10 min-h-screen bg-neo-bg border-t-4 border-neo-border p-8 md:p-24 space-y-24">
        <div className="max-w-6xl mx-auto neo-box p-12 bg-neo-surface">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">How Jan-Setu Works</h2>
          <p className="text-xl max-w-3xl leading-relaxed">
            Citizens report issues in any language, via voice, text, or image. Our AI pipeline instantly translates, 
            categorizes, geo-verifies, and clusters duplicate complaints. The engine then assigns an explainable priority 
            score and computes optimal budget allocations for Members of Parliament.
          </p>
        </div>

        <div id="report" className="max-w-6xl mx-auto scroll-mt-24">
          <CitizenFlow />
        </div>
      </div>
    </main>
  );
}
