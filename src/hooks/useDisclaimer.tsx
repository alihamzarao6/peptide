"use client";

import { useState, useEffect } from "react";

export const useDisclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already accepted disclaimer
    const checkDisclaimerStatus = () => {
      try {
        const hasAccepted = localStorage.getItem(
          "peptideprice_disclaimer_accepted"
        );
        const acceptanceDate = localStorage.getItem(
          "peptideprice_disclaimer_date"
        );

        // Check if acceptance is still valid (optional: you can add expiry logic here)
        if (hasAccepted === "true" && acceptanceDate) {
          const accepted = new Date(acceptanceDate);
          const now = new Date();
          const daysSinceAcceptance = Math.floor(
            (now.getTime() - accepted.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Optional: Re-show disclaimer after 365 days (1 year)
          if (daysSinceAcceptance < 365) {
            setShowDisclaimer(false);
          } else {
            // Clear old acceptance and show disclaimer again
            localStorage.removeItem("peptideprice_disclaimer_accepted");
            localStorage.removeItem("peptideprice_disclaimer_date");
            setShowDisclaimer(true);
          }
        } else {
          // First time visitor
          setShowDisclaimer(true);
        }
      } catch (error) {
        // If localStorage is not available (SSR, private browsing, etc.)
        console.warn("localStorage not available, showing disclaimer");
        setShowDisclaimer(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== "undefined") {
      checkDisclaimerStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAccept = () => {
    setShowDisclaimer(false);
  };

  const handleReject = () => {
    setShowDisclaimer(false);
  };

  return {
    showDisclaimer,
    isLoading,
    handleAccept,
    handleReject,
  };
};
