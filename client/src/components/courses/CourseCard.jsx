import { Link } from 'react-router';
import { ROUTES } from '../../utils/paths.js';
import { primaryButton } from '../common/buttonClasses.js';
import CourseBadges from './CourseBadges.jsx';
import CourseThumbnail from './CourseThumbnail.jsx';
import EnrollmentBadge from './EnrollmentBadge.jsx';

export default function CourseCard({ course, enrollmentStatus }) {
  return (
    <article
      className="
        group relative flex h-full min-w-0 flex-col overflow-hidden
        border border-[#2A2A2A] bg-[#111111]
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-[#FF3E00]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden border-b border-[#2A2A2A]">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <CourseThumbnail src={course.thumbnail} />
        </div>

        {/* Hover accent */}
        <div
          className="
            pointer-events-none absolute inset-x-0 bottom-0 h-px
            bg-[#FF3E00] opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          "
        />
      </div>

      {/* Content */}
      <div className="flex min-h-[250px] flex-1 flex-col p-4 sm:p-5">
        {/* Badges */}
        <div className="flex min-h-6 flex-wrap items-center gap-1.5">
          <CourseBadges course={course} />
          <EnrollmentBadge status={enrollmentStatus} />
        </div>

        {/* Course title */}
        <h2
          className="
            mt-3 line-clamp-2
            text-base font-semibold leading-snug tracking-tight
            text-white
            transition-colors duration-200
            group-hover:text-[#FF3E00]
            sm:text-lg
          "
        >
          {course.title}
        </h2>

        {/* Description */}
        <p
          className="
            mt-2 line-clamp-3
            text-sm leading-6 text-[#A3A3A3]
          "
        >
          {course.shortDescription || 'No description available yet.'}
        </p>

        {/* Bottom section */}
        <div className="mt-auto pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#666666]">
              Course
            </span>

            <span className="h-px flex-1 bg-[#2A2A2A]" />
          </div>

          <Link
            to={ROUTES.course(course.id)}
            className={`
              ${primaryButton}
              inline-flex w-full items-center justify-center
              transition-all duration-200
              group-hover:border-[#FF3E00]
            `}
          >
            View Course
            <span
              className="
                ml-2 transition-transform duration-200
                group-hover:translate-x-1
              "
            >
              →
            </span>

            <span className="sr-only">: {course.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}