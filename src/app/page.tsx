"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchJobs,
  filterJobs,
  FilterParams,
  MIN_JOBS_COUNT,
} from "@/services/jobService";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/Card";
import Footer from "@/components/Footer";
import SkeletonCard from "@/components/SkeletonCard";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { Toaster } from "react-hot-toast";

export default function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const router = useRouter();
  const observerTargetRef = useRef(null);
  const searchParams = React.use(props.searchParams);
  const [localFilters, setLocalFilters] = useState({
    keyword: searchParams?.keyword || "",
    location: searchParams?.location || "",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateURL = useCallback(
    debounce((newFilters: FilterParams) => {
      router.push(`/?keyword=${newFilters.keyword}&location=${newFilters.location}`);
    }, 500),
    [router]
  );

  const handleFilterChange = useCallback((type: "keyword" | "location", value: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [type]: value };
      debouncedUpdateURL(newFilters);
      return newFilters;
    });
  }, [debouncedUpdateURL]);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobs", searchParams],
    queryFn: ({ pageParam = 1 }) => fetchJobs(pageParam, searchParams as FilterParams),
    getNextPageParam: (lastPage, allPages) => 
      lastPage.length >= MIN_JOBS_COUNT ? allPages.length * 20 + 1 : undefined,
    initialPageParam: 1,
  });

  const filteredJobs = React.useMemo(() => {
    const allJobs = data?.pages.flat() || [];
    return filterJobs(allJobs, localFilters).filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
  }, [data?.pages, localFilters]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = observerTargetRef.current;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 1.0,
    });

    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  if (error) return <div>Error fetching jobs</div>;

  return (
    <>
      <Toaster />
      <Header />
      <main className="container mx-auto px-3 py-4 min-h-screen">
        <SearchBar
          initialKeyword={localFilters.keyword}
          initialLocation={localFilters.location}
          onKeywordSearch={(value) => handleFilterChange("keyword", value)}
          onLocationSearch={(value) => handleFilterChange("location", value)}
        />
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex justify-center items-center mt-20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700">
                No Jobs Found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search criteria
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {filteredJobs.map((job) => (
              <div key={job.id}>
                <JobCard
                  id={job.id}
                  title={job.title}
                  salary={job.salary}
                  company={job.company}
                  location={job.location}
                  logoUrl={job.logoUrl}
                />
              </div>
            ))}
          </div>
        )}

        <div ref={observerTargetRef} className="h-10" />

        {isFetchingNextPage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}