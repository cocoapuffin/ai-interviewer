"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/client";
import { Button } from "./ui/button";

export default function GenerateInterview() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUid(user.uid);
      else setUid("anonymous-user"); // 👈 use a default fallback if you're not doing auth
    });

    return () => unsub();
  }, []);

  const handleGenerate = async () => {
    if (!uid) return;

    setLoading(true);

    const res = await fetch("/api/vapi/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "mixed",
        role: "frontend",
        level: "senior",
        techstack: "next.js",
        amount: 7,
        userid: uid, // 👈 this is key — pass it even if it's a dummy value
      }),
    });

    const data = await res.json();
    console.log("Generation result:", data);
    setLoading(false);
  };

  return (
    <div className="my-4">
      <Button className="btn-primary" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Interview"}
      </Button>
    </div>
  );
}
