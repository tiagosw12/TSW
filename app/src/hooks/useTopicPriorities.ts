import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TopicPriority } from "../types/db";

export function useTopicPriorities() {
  const [priorities, setPriorities] = useState<TopicPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [refetch]);

  return { priorities, loading, error, refetch };
}
