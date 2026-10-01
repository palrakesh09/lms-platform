import { Link } from "react-router";
import { dashboardPaths } from "../../../utils/dashboardPaths.js";
import { formatDate, formatLabel } from "../../../utils/formatters.js";
import { ROUTES } from "../../../utils/paths.js";
import {
  dangerLinkButton,
  linkButton,
} from "../../common/buttonClasses.js";
import StatusBadge from "../../common/StatusBadge.jsx";
import CourseThumbnail from "../../courses/CourseThumbnail.jsx";

export default function CourseTable({ courses, area, onAction }) {
  const isAdmin = area === "admin";
  const paths = dashboardPaths(area);

  return (
    <div className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
      {/* Desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="dashboard-table">
          <caption className="sr-only">Courses</caption>

          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Level</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <div className="flex min-w-[260px] items-center gap-4">
                    <CourseThumbnail
                      src={course.thumbnail}
                      className="h-12 w-20 shrink-0 border border-[#2A2A2A] object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-white">
                        {course.title}
                      </p>

                      <p className="mt-1 max-w-[260px] truncate font-mono text-[10px] text-neutral-600">
                        {course.slug}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="text-neutral-400">
                    {formatLabel(course.category)}
                  </span>
                </td>

                <td>
                  <span className="font-mono text-xs uppercase text-neutral-500">
                    {formatLabel(course.level)}
                  </span>
                </td>

                <td>
                  <StatusBadge status={course.status} />
                </td>

                <td>
                  <span className="font-mono text-[10px] text-neutral-600">
                    {formatDate(course.createdAt)}
                  </span>
                </td>

                <td>
                  <CourseActions
                    course={course}
                    area={area}
                    paths={paths}
                    isAdmin={isAdmin}
                    onAction={onAction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet */}
      <div className="divide-y divide-[#2A2A2A] lg:hidden">
        {courses.map((course, index) => (
          <MobileCourseCard
            key={course.id}
            course={course}
            index={index}
            area={area}
            paths={paths}
            isAdmin={isAdmin}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}

function MobileCourseCard({
  course,
  index,
  area,
  paths,
  isAdmin,
  onAction,
}) {
  return (
    <article className="p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center border border-[#2A2A2A] font-mono text-[9px] text-neutral-600">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex gap-3">
            <CourseThumbnail
              src={course.thumbnail}
              className="hidden h-14 w-20 shrink-0 border border-[#2A2A2A] object-cover sm:block"
            />

            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold text-white">
                {course.title}
              </h3>

              <p className="mt-1 truncate font-mono text-[10px] text-neutral-600">
                {course.slug}
              </p>

              <div className="mt-3">
                <StatusBadge status={course.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#2A2A2A] py-3">
            <Meta label="Category" value={formatLabel(course.category)} />
            <Meta label="Level" value={formatLabel(course.level)} />
            <Meta label="Created" value={formatDate(course.createdAt)} />
          </div>

          <div className="mt-4">
            <CourseActions
              course={course}
              area={area}
              paths={paths}
              isAdmin={isAdmin}
              onAction={onAction}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-700">
        {label}
      </p>
      <p className="mt-1 truncate text-xs text-neutral-400">
        {value}
      </p>
    </div>
  );
}

function CourseActions({
  course,
  paths,
  isAdmin,
  onAction,
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <Link
        to={ROUTES.course(course.id)}
        className={linkButton}
      >
        View
      </Link>

      <Link
        to={paths.editCourse(course.id)}
        className={linkButton}
      >
        Edit
      </Link>

      <Link
        to={paths.course(course.id)}
        className={linkButton}
      >
        Manage
      </Link>

      {isAdmin && (
        <>
          {course.status !== "published" && (
            <button
              type="button"
              onClick={() =>
                onAction({
                  type: "publish",
                  course,
                })
              }
              className={`${linkButton} !text-[#22C55E]`}
            >
              Publish
            </button>
          )}

          {course.status !== "archived" && (
            <button
              type="button"
              onClick={() =>
                onAction({
                  type: "archive",
                  course,
                })
              }
              className={linkButton}
            >
              Archive
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onAction({
                type: "delete",
                course,
              })
            }
            className={dangerLinkButton}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}