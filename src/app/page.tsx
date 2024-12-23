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
import React, { useRef, useCallback, useEffect } from "react";
import {  useRouter } from "next/navigation";
// import debounce from "lodash/debounce";
import { Toaster } from "react-hot-toast";






export default function JobsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const router = useRouter();
  const observerTargetRef = useRef(null);
  const searchParams = React.use(props.searchParams);
  const filters: FilterParams = ({
    keyword: searchParams?.keyword || "",
    location: searchParams?.location || "",
  });

  const setFilters = (newFilters: typeof filters) =>{
    router.push(`/?keyword=${newFilters.keyword}&location=${newFilters.location}`);
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: ({ pageParam = 1 }) => fetchJobs(pageParam, filters),
    getNextPageParam: (lastPage, allPages) => {
      console.log("lastPage", lastPage);
      console.log("allPages", allPages);
      return lastPage.length >= MIN_JOBS_COUNT
        ? allPages.length * 20 + 1
        : undefined;
    },
    initialPageParam: 1,
  });


  // const updateURL = useCallback(
  //   debounce((newFilters: Record<string, string | undefined | null>) => {
  //     const params = new URLSearchParams(searchParams.toString());
  
  //     Object.entries(newFilters).forEach(([key, value]) => {
  //       if (value) {
  //         params.set(key, value);
  //       } else {
  //         params.delete(key);
  //       }
  //     });
  
  //     router.push(`?${params.toString()}`);
  //   }, 500),
  //   [searchParams, router]
  // );


  const handleFilterChange = (type: "keyword" | "location", value: string) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
  };


  const filteredJobs =
    data?.pages.flatMap((page) => filterJobs(page, filters)) || [];

  const uniqueFilteredJobs = filteredJobs.filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  );

  console.log("filteredJobs in ui", uniqueFilteredJobs);


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
    console.log("observerTargetRef", observerTargetRef);

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
  }, [observerTargetRef, handleObserver]);


  if (error) return <div>Error fetching jobs</div>;

  return (
    <>
      <Toaster />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchBar
          initialKeyword={filters.keyword}
          initialLocation={filters.location}
          onKeywordSearch={(value) => handleFilterChange("keyword", value)}
          onLocationSearch={(value) => handleFilterChange("location", value)}
        />
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : uniqueFilteredJobs.length === 0 ? (
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
            {uniqueFilteredJobs.map((job) => (
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
