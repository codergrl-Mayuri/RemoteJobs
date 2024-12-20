'use client'
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/Card";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "@/services/jobService";

export default function JobsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", 1],
    queryFn: () => fetchJobs(1),
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching jobs</div>;
  if (data) console.log("Data", data);

  return (
    <>
      <Toaster />
      <Header />
      <SearchBar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow px-9 pb-6">
          <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : data?.map((job) => (
                  <div key={job.id}>
                    <JobCard
                    title={job.title}
                    salary={job.salary}
                    company={job.company}
                    location={job.location}
                    logoUrl={job.logoUrl}
                    isHovered={hoveredCard === job.id} id={""} />
                  </div>
                ))}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

