import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TopicPriority } from "../types/db";
import { useDataRefresh } from "../contexts/DataRefreshContext";

export function useTopicPriorities() {
  const [priorities, setPriorities] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = useDataRefresh();

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
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, version]);

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

  return { priorities, loading, error, refetch };
}
