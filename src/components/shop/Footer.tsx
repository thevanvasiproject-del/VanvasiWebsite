import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#14261C] text-[#FBF9F5] border-t border-[#2A4E3B] pt-16 pb-12 px-6 sm:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10 items-start">
          {/* Brand & Stamp */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <img src="/images/6.png" alt="Vanvasi stamp logo" className="w-20 h-20 object-contain rounded-md" />
              <div>
                <span className="font-serif tracking-[0.25em] text-sm uppercase text-[#FBF9F5] block font-semibold">
                  The Vanvasi Project
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-[#E8B931] font-medium">
                  Himalayan Small-Batch Butters
                </span>
              </div>
            </div>
            <p className="text-xs text-[#FBF9F5]/70 max-w-sm font-sans leading-relaxed">
              Crafted in Kathmandu from pure cultured cream, wild honey, and mountain herbs. Each batch is uniquely charactered and dated.
            </p>
          </div>

          {/* Lazimpat Location & Hours */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#E8B931] font-sans font-semibold">
              The Kitchen &amp; Workshop
            </h4>
            <div className="space-y-2.5 text-xs text-[#FBF9F5]/80 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E8B931] flex-shrink-0 mt-0.5" />
                <span>Nursery Road, Lazimpat, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E8B931] flex-shrink-0" />
                <span>Pickup: 10:00 AM – 6:00 PM (Sun – Fri)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E8B931] flex-shrink-0" />
                <a href="tel:+9779705670733" className="hover:underline">+977 970-5670733</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E8B931] flex-shrink-0" />
                <span>hello@thevanvasiproject.com.np</span>
              </div>
            </div>
          </div>

          {/* Quick links & Admin */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#E8B931] font-sans font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#FBF9F5]/80">
              <li>
                <Link href="/#flavours" className="hover:text-white transition-colors">
                  The Flavour Characters
                </Link>
              </li>
              <li>
                <Link href="/#story" className="hover:text-white transition-colors">
                  Our Himalayan Story
                </Link>
              </li>
              <li>
                <Link href="/#visit" className="hover:text-white transition-colors">
                  Kathmandu Delivery &amp; Pickup
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-[#E8B931] hover:underline"
                >
                  <span>Kitchen Inventory Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FBF9F5]/50 font-sans gap-4">
          <p>© {new Date().getFullYear()} The Vanvasi Project. All rights reserved.</p>
          <p className="tracking-wide">
            Designed for Kathmandu with Care • Currency: NPR Only
          </p>
        </div>
      </div>
    </footer>
  );
}
