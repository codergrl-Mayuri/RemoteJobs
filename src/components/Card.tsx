import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bookmark, MapPin } from "lucide-react"; 
import Image from "next/image";
import { JobCardProps } from "@/types/job";


const JobCard: React.FC<JobCardProps> = ({
  title,
  salary,
  company,
  location,
  logoUrl,
}) => {

    const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <Card
      className={`w-full h-40 border border-gray-200 shadow-md rounded-sm overflow-hidden transition-transform ease-in-out duration-300 transform
        ${
          isHovered
            ? "scale-105 border-gray-300 shadow-lg bg-gradient-to-r from-orange-100 to-white"
            : "bg-gradient-to-r from-gray-50 via-white to-gray-50"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <Bookmark
            className="h-5 w-5 text-black hover:text-black ml-auto mr-2"
            
          />
      </CardContent>
    </Card>
  );
};

export default JobCard;


