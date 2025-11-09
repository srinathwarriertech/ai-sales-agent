import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/lib/mcp/supabase-mcp";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const levelColor = {
    beginner: "text-green-600 bg-green-50",
    intermediate: "text-blue-600 bg-blue-50",
    advanced: "text-purple-600 bg-purple-50",
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              levelColor[course.level]
            }`}
          >
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
          <span className="text-sm font-semibold text-primary">
            {formatPrice(course.price)}
          </span>
        </div>
        <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            {course.category}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          by {course.instructor}
        </p>
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

