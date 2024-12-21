import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface JobCardProps {
  index: number; 
  title: string;
  salary: string;
  company: string;
  location: string;
  logoUrl: string;
  pageIndex: number; 
}

const JobCard: React.FC<JobCardProps> = ({
  index,
  title,
  salary,
  company,
  location,
  logoUrl,
  pageIndex,
}) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const uniqueJobId = `${pageIndex}-${index}`;

  useEffect(() => {
    const bookmarkedJobs = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
    setIsBookmarked(bookmarkedJobs.includes(uniqueJobId));  
  }, [uniqueJobId]);

  
  const toggleBookmark = () => {
    const bookmarkedJobs = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");

    
    if (isBookmarked) {
      const updatedBookmarks = bookmarkedJobs.filter((jobId: string) => jobId !== uniqueJobId);
      localStorage.setItem("bookmarkedJobs", JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      if (!bookmarkedJobs.includes(uniqueJobId)) {
        const updatedBookmarks = [...bookmarkedJobs, uniqueJobId];
        localStorage.setItem("bookmarkedJobs", JSON.stringify(updatedBookmarks));
        setIsBookmarked(true);
      }
    }
  };

  return (
    <Card className="w-full h-40 border border-gray-200 shadow-md rounded-sm overflow-hidden transition-transform ease-in-out duration-300 transform 
      hover:scale-105 hover:border-gray-300 hover:shadow-lg hover:bg-gradient-to-r hover:from-orange-100 hover:to-white bg-gradient-to-r from-gray-50 via-white to-gray-50">
      <CardHeader className="p-3 text-left mr-8 ml-2">
        <CardTitle className="text-base font-semibold mb-1">{title}</CardTitle>
        <div className="flex items-left gap-3">
          <Badge variant="secondary" className="w-fit text-green-500 bg-green-100">
            REMOTE
          </Badge>
          <p className="text-sm text-gray-500">Salary: {salary}</p>
        </div>
      </CardHeader>

      <CardContent className="flex justify-start items-center p-3 gap-3 ml-2">
        <Image
          src={logoUrl}
          alt="Company Logo"
          width={40}
          height={40}
          className="rounded"
        />
        <div className="text-sm text-left">
          <p className="font-medium">{company}</p>
          <div className="flex items-center text-gray-500 text-xs">
            <MapPin className="h-4 w-4 mr-3" />
            {location}
          </div>
        </div>
        {isBookmarked ? (
          <BookmarkCheck
            className="h-5 w-5 text-black hover:text-black ml-auto mr-2"
            onClick={toggleBookmark}
          />
        ) : (
          <Bookmark
            className="h-5 w-5 text-gray-400 hover:text-black ml-auto mr-2"
            onClick={toggleBookmark}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
