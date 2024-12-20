'use client'
import React, { useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/Card";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";
import { Toaster } from "react-hot-toast";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchJobs } from "@/services/jobService";
import { JobCardProps } from "@/types/job";

export default function JobsPage() {

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
   } = useInfiniteQuery<JobCardProps[], Error>({
    queryKey: ["jobs"],
    queryFn: ({ pageParam = 1 }) => fetchJobs(pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1: undefined;
    },
    initialPageParam: 1,
   });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target =entries[0];
      if(target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );
  
  useEffect(() => {
    const element = observerTargetRef.current;
    const observer = new IntersectionObserver(handleObserver,{
      root: null,
      rootMargin: "100px",
      threshold: 1.0,
    });
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [observerTargetRef, handleObserver]);
  console.log("data", data);
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error Fetching Data</div>


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching jobs</div>;
  if (data) console.log("Data", data);
  console.log(data)

  return (
    <>
      <Toaster />
      <Header />
      <SearchBar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow px-9 pb-6">
          <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.pages.map((page, pageIndex) =>
              page.map((job, index) => (
                <div key={`${pageIndex}-${index}`}>
                  <JobCard
                    index={index}
                    title={job.title}
                    salary={job.salary}
                    company={job.company}
                    location={job.location}
                    logoUrl={job.logoUrl}
                    pageIndex={pageIndex}  // Pass pageIndex for unique ID generation
                  />
                </div>
              ))
            )}
                {isFetchingNextPage && 
                  Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
                  ))}
          </section>
          <div ref={observerTargetRef} className="observer-target" />
        </main>
        <Footer />
      </div>
    </>
  );
}

