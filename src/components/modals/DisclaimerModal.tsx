"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Check, X, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DisclaimerModalProps {
  onAccept: () => void;
  onReject: () => void;
}

export function DisclaimerModal({ onAccept, onReject }: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleAccept = () => {
    // Store acceptance in localStorage
    localStorage.setItem("peptideprice_disclaimer_accepted", "true");
    localStorage.setItem(
      "peptideprice_disclaimer_date",
      new Date().toISOString()
    );
    setIsOpen(false);
    onAccept();
  };

  const handleReject = () => {
    setIsOpen(false);
    onReject();
    // Redirect to cat pictures 😂
    window.location.href = "https://www.google.com/search?q=cute+cats&tbm=isch";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-4 !bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Research Use Disclaimer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            By entering this site, you confirm and agree to the following:
          </p>

          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>You are 18 years or older</li>
            <li>All content and tools are strictly for research use</li>
            <li>
              Information will not be used for human consumption or medical
              treatment
            </li>
            <li>
              Research conducted within legal, licensed facilities or for
              educational purposes
            </li>
            <li>
              You assume complete responsibility for how you use this
              information
            </li>
          </ul>

          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-xs text-gray-600">
              <strong>Important:</strong> This website does not provide medical
              advice and we do not endorse the misuse of any research compounds.
              All information is provided for educational and research purposes
              only.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAccept}
              className="flex-1 hover:!bg-gray-200/70"
              size="sm"
              variant={"outline"}
            >
              I Agree
            </Button>
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 hover:!bg-gray-200/70"
              size="sm"
            >
              Exit
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            If you do not agree to these terms, please exit the site.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
