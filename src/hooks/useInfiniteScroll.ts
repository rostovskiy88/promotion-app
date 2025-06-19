import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distance from bottom in pixels
  root?: Element | null;
}

export const useInfiniteScroll = ({
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
  root = null,
}: UseInfiniteScrollOptions) => {
  const loadingRef = useRef(false);

  const checkIfNeedsMoreContent = useCallback(() => {
    const scrollElement = root || document.documentElement;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;

    // If content is shorter than viewport (no scrollbar), load more content
    const isContentTooShort = scrollHeight <= clientHeight;

    if (isContentTooShort && hasMore && !loading && !loadingRef.current) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore, root]);

  const handleScroll = useCallback(() => {
    if (loadingRef.current || loading || !hasMore) {
      return;
    }

    const scrollElement = root || document.documentElement;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore, threshold, root]);

  useEffect(() => {
    if (!loading) {
      loadingRef.current = false;
    }
  }, [loading]);

  // Check if we need more content whenever loading state changes
  useEffect(() => {
    if (!loading) {
      const timeoutId = setTimeout(checkIfNeedsMoreContent, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, checkIfNeedsMoreContent]);

  useEffect(() => {
    const scrollElement = root || window;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, root]);

  return null;
};
