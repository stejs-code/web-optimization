"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputWithPrefix } from "@/components/ui/input-with-prefix";
import { generateRandomCode } from "@/lib/utils";
import { createLink } from "@/app/links/actions";

export function LinkForm() {
  const router = useRouter();
  const [shortCode, setShortCode] = useState("");
  const [destination, setDestination] = useState("");
  const [errors, setErrors] = useState<{ shortCode?: string; destination?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRandomize = () => {
    setShortCode(generateRandomCode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { shortCode?: string; destination?: string } = {};

    if (!shortCode || shortCode.length < 4) {
      newErrors.shortCode = "Short code must be at least 4 characters";
    }

    if (!destination) {
      newErrors.destination = "Destination is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await createLink(shortCode, destination);

    console.log("Form result:", result);

    if (result.error) {
      setErrors({ destination: result.message });
    } else {
      setShortCode("");
      setDestination("");
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <label className="mb-2 block text-sm">Short code</label>
      <div className="mb-4 flex gap-x-4">
        <InputWithPrefix
          prefix="link.stejs.cz/"
          placeholder="short-code"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="button" variant="secondary" onClick={handleRandomize} disabled={isSubmitting}>
          Randomize
        </Button>
      </div>
      {errors.shortCode && (
        <div className="text-red-600 text-sm mb-4">Error: {errors.shortCode}</div>
      )}

      <label className="mb-2 block text-sm">Destination</label>
      <Input
        type="text"
        placeholder="https://example.com"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="mb-4"
        disabled={isSubmitting}
      />
      {errors.destination && (
        <div className="text-red-600 text-sm mb-4">Error: {errors.destination}</div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
