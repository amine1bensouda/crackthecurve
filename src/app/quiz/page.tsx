'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Layout/Navigation';
import CourseCard from '@/components/Quiz/CourseCard';
import LoadingSpinner from '@/components/Layout/LoadingSpinner';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  modules: {
    id: string;
    title: string;
    slug: string;
    order: number;
    _count: {
      quizzes: number;
    };
  }[];
  _count: {
    modules: number;
  };
}

export default function QuizListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const coursesResponse = await fetch('/api/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
          const total = coursesData.reduce((sum: number, course: Course) => {
            return sum + course.modules.reduce((moduleSum, module) => moduleSum + module._count.quizzes, 0);
          }, 0);
          setTotalQuizzes(total);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getTotalQuizzesForCourse = (course: Course): number => {
    return course.modules.reduce((total, module) => total + module._count.quizzes, 0);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="mx-auto max-w-[1160px] px-6 py-14 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] font-semibold text-[#2c3c5e]">
            All Quizzes
          </h1>
          {!loading && (
            <p className="mx-auto mt-4 max-w-2xl text-[#6b7180]">
              {totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''} available to prepare for your
              licensing and certification exams
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-5 py-20">
            <LoadingSpinner size="lg" />
            <p className="font-display text-lg font-semibold text-[#2c3c5e]">Loading…</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const courseTotalQuizzes = getTotalQuizzesForCourse(course);
              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  moduleCount={course._count.modules}
                  totalQuizzes={courseTotalQuizzes}
                  slug={course.slug}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-12 text-center">
            <h3 className="font-display text-2xl font-semibold text-[#2c3c5e]">No Courses Available</h3>
            <p className="mt-3 text-[#6b7180]">Check back soon for new license practice banks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
