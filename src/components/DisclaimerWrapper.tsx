"use client";

import { DisclaimerModal } from "./modals/DisclaimerModal";
import { useDisclaimer } from "@/hooks/useDisclaimer";

interface DisclaimerWrapperProps {
  children: React.ReactNode;
}

export function DisclaimerWrapper({ children }: DisclaimerWrapperProps) {
  const { showDisclaimer, isLoading, handleAccept, handleReject } =
    useDisclaimer();

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show disclaimer modal if needed */}
      {showDisclaimer && (
        <DisclaimerModal onAccept={handleAccept} onReject={handleReject} />
      )}

      {/* Main app content - only render if disclaimer is not showing or has been accepted */}
      <div className={showDisclaimer ? "pointer-events-none opacity-50" : ""}>
        {children}
      </div>
    </>
  );
}
