"use client";

import { useState } from "react";
import { X, ChevronRight, Flag, Check } from "lucide-react";
import { reportReasons } from "@/lib/data";
import { toast } from "./Toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "video" | "user" | "comment";
  targetId: string | number;
  targetName?: string;
}

export function ReportModal({ isOpen, onClose, targetType, targetId, targetName }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [step, setStep] = useState<"reason" | "details" | "submitted">("reason");

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Simulate API call
    console.log("Report submitted:", {
      targetType,
      targetId,
      reason: selectedReason,
      details: additionalDetails
    });
    
    setStep("submitted");
    
    setTimeout(() => {
      onClose();
      setStep("reason");
      setSelectedReason(null);
      setAdditionalDetails("");
    }, 2000);
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case "video":
        return "video";
      case "user":
        return "account";
      case "comment":
        return "comment";
      default:
        return "content";
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 z-50 flex items-end animate-in slide-in-from-bottom duration-300">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button 
            onClick={step === "reason" ? onClose : () => setStep("reason")}
            className="text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold">
            {step === "submitted" ? "Report submitted" : `Report ${getTargetLabel()}`}
          </span>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "reason" && (
            <div className="divide-y divide-white/10">
              <div className="p-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Flag className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Why are you reporting this?</p>
                    <p className="text-white/50 text-sm">Your report is anonymous</p>
                  </div>
                </div>
              </div>
              
              {reportReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => {
                    setSelectedReason(reason.id);
                    setStep("details");
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <div>
                    <p className="text-white font-medium">{reason.label}</p>
                    <p className="text-white/50 text-sm">{reason.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </button>
              ))}
            </div>
          )}

          {step === "details" && (
            <div className="p-4 space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Selected reason</p>
                <p className="text-white font-medium">
                  {reportReasons.find(r => r.id === selectedReason)?.label}
                </p>
              </div>
              
              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Additional details (optional)
                </label>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Please provide more details about the issue..."
                  className="w-full bg-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-[#fe2c55] text-white py-3 rounded-lg font-semibold hover:bg-[#fe2c55]/90 transition-colors"
              >
                Submit report
              </button>

              <button
                onClick={() => setStep("reason")}
                className="w-full py-3 text-white/60 font-medium hover:text-white transition-colors"
              >
                Go back
              </button>
            </div>
          )}

          {step === "submitted" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Thank you for reporting</h3>
              <p className="text-white/60 text-sm">
                We'll review your report and take appropriate action. Your feedback helps keep our community safe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
