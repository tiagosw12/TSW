import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TopicPriority } from "../types/db";

export function useTopicPriorities() {
  const [priorities, setPriorities] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("get_topic_priorities");
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setError(null);
      setPriorities(data ?? []);
    }
    setLoading(false);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") refetch();
    }
    window.addEventListener("focus", refetch);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", refetch);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refetch]);

  return { priorities, loading, error, refetch, version };
}
