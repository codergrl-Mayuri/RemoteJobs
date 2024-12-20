import { JobCardProps, JobDetailsFromHtml } from "@/types/job";
import * as cheerio from "cheerio";


export function parseJobHTML( html:string ): JobCardProps[] {
    try{
        console.log("Parsing HTMl")
        const $ = cheerio.load(html);
        const jobJsonParsed: JobDetailsFromHtml[] = [];
        const jsonDatafromHtml = $('script[type="application/ld+json"]');
        console.log("jsonDatafromHtml", jsonDatafromHtml);
        
        jsonDatafromHtml.each((_, element) => {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              const jsonData = JSON.parse(element.children[0].data);
              jobJsonParsed.push(jsonData);
            } catch (error) {
              console.error("Error parsing JSON data from HTML element:", error);
            }
          });

          console.log("jobJson", jobJsonParsed);

          if (jobJsonParsed.length === 0) {
            throw new Error("No job data found in HTML");
          }

          let i = 0;
    const jobCardProps: JobCardProps[] = jobJsonParsed.map(
      (jobJson: JobDetailsFromHtml) => {
        return {
          id: i++,
          title: jobJson.title ?? "",
          company: jobJson.hiringOrganization.name ?? "",
          location: "",

          salary:
            "$" +
            jobJson.baseSalary.value.minValue +
            " - " +
            "$" +
            jobJson.baseSalary.value.maxValue,
          tags: [jobJson.industry],
          postedTime: jobJson.datePosted ?? "",
          description: jobJson.description ?? "",
          applyLink: jobJson.hiringOrganization.url ?? "",
          logoUrl: "https://github.com/shadcn.png",
        };
      }
    );

    console.log("Parsing Completed");
    return jobCardProps;

    }
    catch(error){
        console.log(error);
        return [];
    }
}