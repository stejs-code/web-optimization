"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { deleteLink } from "@/app/links/actions";

export interface LinkItemProps {
  id: number;
  shortCode: string;
  destination: string;
  visits?: number;
}

export function LinkItem({ shortCode, destination, visits }: LinkItemProps) {
  const [copyText, setCopyText] = useState("Copy");
  const [isDeleting, setIsDeleting] = useState(false);
  const fullUrl = `https://link.stejs.cz/${shortCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy"), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteLink(shortCode);
  };

  return (
    <div className="pb-4 mb-4 border-b border-b-slate-800 last:border-b-0">
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener"
        className="underline text-lg sm:text-2xl font-bold hover:text-purple-400 transition-colors"
      >
        link.stejs.cz/{shortCode}
      </a>

      <div className="text-slate-400 select-none text-sm mb-2">
        Destination: {destination}
      </div>

      <div className="text-slate-400 select-none text-sm mb-4">
        Visits: {visits ?? 0}
      </div>

      <div className="flex gap-x-4 flex-wrap items-start">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copyText}
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
