"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MapPin, Clock, Phone, Store, Truck, ShieldCheck } from "lucide-react";

export function OrderConfirmationView() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams?.get("orderNumber") || "TVP-1004";
  const name = searchParams?.get("name") || "Valued Customer";
  const phone = searchParams?.get("phone") || "98XXXXXXXX";
  const fulfilment = searchParams?.get("fulfilment") || "delivery";
  const area = searchParams?.get("area") || "Kathmandu";
  const address = searchParams?.get("address") || "N/A";
  const subtotal = searchParams?.get("subtotal") || "1400";
  const fee = searchParams?.get("fee") || "100";
  const total = searchParams?.get("total") || "1500";
  const itemsCount = searchParams?.get("itemsCount") || "2";

  const isPickup = fulfilment === "pickup";

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#E6DFD5] rounded-xs p-8 sm:p-12 shadow-xs space-y-8">
      {/* Header status */}
      <div className="text-center space-y-4 pb-8 border-b border-[#F4EFE6]">
        <div className="w-16 h-16 rounded-full bg-[#EBF0EC] text-[#1F3A2B] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#E8B931] bg-[#1F3A2B] px-3 py-1 rounded-full inline-block mb-3">
            Prototype Preview • Order Simulated
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#1F3A2B]">
            Thank You, {name}
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6961] font-sans mt-2">
            Your butter order has been received and allocated in the system.
          </p>
        </div>

        <div className="inline-block px-4 py-2 bg-[#FBF9F5] border border-[#E6DFD5] rounded-xs">
          <span className="text-xs font-sans text-[#5E6961]">Order Reference: </span>
          <span className="font-serif font-bold text-sm text-[#1F3A2B]">
            {orderNumber}
          </span>
        </div>
      </div>

      {/* Fulfilment Instructions */}
      <div className="p-6 bg-[#FBF9F5] border border-[#E6DFD5] rounded-xs space-y-4">
        <div className="flex items-center gap-3">
          {isPickup ? (
            <Store className="w-5 h-5 text-[#1F3A2B]" />
          ) : (
            <Truck className="w-5 h-5 text-[#1F3A2B]" />
          )}
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-[#1F3A2B]">
            {isPickup ? "Pickup Instructions (Lazimpat)" : "Delivery Details (Kathmandu)"}
          </h2>
        </div>

        {isPickup ? (
          <div className="space-y-3 text-xs font-sans text-[#1C241E]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#1F3A2B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#1F3A2B]">The Vanvasi Project Workshop</p>
                <p className="text-[#5E6961]">Nursery Road, Lazimpat, Kathmandu (Near Shankar Hotel)</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[#5E6961]">
              <Clock className="w-4 h-4 text-[#1F3A2B] flex-shrink-0" />
              <span>Pickup Hours: 10:00 AM – 6:00 PM, Sunday to Friday</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#5E6961]">
              <Phone className="w-4 h-4 text-[#1F3A2B] flex-shrink-0" />
              <span>Contact: <a href="tel:+9779705670733" className="text-[#1F3A2B] font-medium hover:underline">+977 970-5670733</a></span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs font-sans text-[#1C241E]">
            <div>
              <span className="text-[#5E6961]">Delivery Area: </span>
              <span className="font-medium text-[#1F3A2B]">{area}</span>
            </div>
            <div>
              <span className="text-[#5E6961]">Address: </span>
              <span className="font-medium text-[#1F3A2B]">{address}</span>
            </div>
            <div>
              <span className="text-[#5E6961]">Contact Phone: </span>
              <span className="font-medium text-[#1F3A2B]">{phone}</span>
            </div>
            <p className="text-[11px] text-[#5E6961] pt-1">
              Our courier rider will call this number prior to arrival.
            </p>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="space-y-3 pt-2 text-xs font-sans">
        <div className="flex justify-between text-[#5E6961]">
          <span>Ordered Items</span>
          <span className="text-[#1C241E] font-medium">{itemsCount} Jars</span>
        </div>
        <div className="flex justify-between text-[#5E6961]">
          <span>Subtotal</span>
          <span className="text-[#1C241E] font-medium">NPR {subtotal}</span>
        </div>
        <div className="flex justify-between text-[#5E6961]">
          <span>{isPickup ? "Pickup Fee" : "Kathmandu Delivery Fee"}</span>
          <span className="text-[#1C241E] font-medium">
            {fee === "0" ? "FREE" : `NPR ${fee}`}
          </span>
        </div>
        <div className="flex justify-between text-base font-serif font-bold text-[#1F3A2B] pt-3 border-t border-[#F4EFE6]">
          <span>Total Payable on Delivery / Pickup</span>
          <span>NPR {total}</span>
        </div>
      </div>

      {/* Payment Note */}
      <div className="p-4 bg-[#EBF0EC]/60 border border-[#1F3A2B]/20 rounded-xs flex items-center gap-3 text-xs font-sans text-[#1F3A2B]">
        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
        <span>
          Payment is collected in <strong>Cash (NPR)</strong> upon {isPickup ? "collection in Lazimpat" : "doorstep delivery"}.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex-1 py-3.5 px-4 bg-[#1F3A2B] hover:bg-[#2A4E3B] text-white text-xs font-semibold uppercase tracking-widest font-sans text-center rounded-xs transition-colors shadow-xs"
        >
          Return to Homepage
        </Link>
        <Link
          href="/admin"
          className="flex-1 py-3.5 px-4 bg-[#F4EFE6] hover:bg-[#EBF0EC] text-[#1F3A2B] border border-[#E6DFD5] text-xs font-semibold uppercase tracking-widest font-sans text-center rounded-xs transition-colors"
        >
          View Admin Inventory
        </Link>
      </div>
    </div>
  );
}
