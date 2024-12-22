import axios from "axios";
import { parseJobHTML } from "../utils/jobParser";
import { JobCardProps } from "../types/job";

const BASE_URL = "https://remote-jobs.remote-jobs-legacy.workers.dev/jobs";
export const MIN_JOBS_COUNT = 12; 

interface FilterParams {
  keyword?: string;
  location?: string;
}

export async function fetchJobs(
  offset = 0,
  filters: FilterParams = {}
): Promise<JobCardProps[]> {
  let allJobs: JobCardProps[] = [];
  console.log("offset", offset);
  let currentOffset = offset;
  const maxAttempts = 5; 
  let attempts = 0;

  while (allJobs.length < MIN_JOBS_COUNT && attempts < maxAttempts) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          offset: currentOffset,
          keyword: filters.keyword,
          location: filters.location,
        },
        headers: {
          Accept: "*/*",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const parsedJobs: JobCardProps[] = parseJobHTML(response.data);

      
      const filteredJobs = parsedJobs.filter((job) => {
        const matchesKeyword =
          !filters.keyword ||
          job.tags.some((tag) =>
            tag.toLowerCase().includes(filters.keyword?.toLowerCase() ?? "")
          );

        const matchesKeywords =
          !filters.keyword ||
          [
            job.title,
            job.company,
            job.description,
            ...job.tags,
            job.salary,
          ].some((field) =>
            field?.toLowerCase().includes(filters.keyword?.toLowerCase() ?? "")
          );

        const matchesLocation =
          !filters.location ||
          job.location.toLowerCase().includes(filters.location.toLowerCase());

        return matchesKeywords && matchesKeyword && matchesLocation;
      });

      allJobs = [...allJobs, ...filteredJobs];

      currentOffset++;
      attempts++;

      if (parsedJobs.length === 0) break;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  }

  return allJobs;
}


export function filterJobs(
  jobs: JobCardProps[],
  filters: FilterParams
): JobCardProps[] {
  return jobs.filter((job) => {
    const searchTerm = filters.keyword?.toLowerCase() || "";
    const locationTerm = filters.location?.toLowerCase() || "";

    
    const matchesKeyword =
      !searchTerm ||
      [job.title, job.company, job.description, ...job.tags, job.salary].some(
        (field) => field?.toLowerCase().includes(searchTerm)
      );

    
    const matchesLocation =
      !locationTerm || job.location.toLowerCase().includes(locationTerm);

    const result = matchesKeyword && matchesLocation;

    return result;
  });
}
