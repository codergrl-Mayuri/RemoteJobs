import { JobCardProps } from "@/types/job";
import * as cheerio from "cheerio";


export function parseJobHTML( html:string ): JobCardProps[] {

        const htmlParsing = `<table>${html}</table>`;
        console.log("Parsing HTMl", htmlParsing)

        const $ = cheerio.load(htmlParsing);

        const results: JobCardProps[] = [];

        $("tr[data-offset]").each((index, element) => {
            const tr = $(element);

            const jsonData = tr.find('script[type="application/ld+json"]').html();
            if (!jsonData) return;

            try{
                const jobJson = JSON.parse(jsonData);

                const id = tr.attr("data-id") ?? "";
                const title = jobJson.title ?? "";
                const company = jobJson.hiringOrganization.name ?? "";

                const locationDiv = tr.find("div.location").first();
                const location = locationDiv.length
                    ? locationDiv.text().trim()
                    : "Not Available";

                const salary = jobJson.baseSalary?.value
                    ? `$${jobJson.baseSalary.value.minValue} - $${jobJson.baseSalary.value.maxValue}`
                    : "";
                const postedTime = jobJson.datePosted ?? "";
                const description = jobJson.description ?? "";
                const applyLink = jobJson.hiringOrganization.url ?? "";
                const logoUrl = jobJson.hiringOrganization.logo?.url ?? "https://github.com/shadcn.png";

                const tags = tr
                    .find(".tag h3")
                    .map((_, el) => $(el).text().trim())
                    .get();

                    
                    results.push({
                        id,
                        title,
                        company,
                        location,
                        salary,
                        tags,
                        postedTime,
                        description,
                        applyLink,
                        logoUrl,
                    });
                    } catch (error) {
                        console.error("Error parsing job JSON:", error);
                    }
        });
        console.log("results", results);
        return results;
    }