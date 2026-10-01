import { Link } from 'react-router';
import { useCourses } from '../hooks/useCourses.js';
import { REQUEST_STATUS } from '../hooks/useApiResource.js';
import { ROUTES } from '../utils/paths.js';
import Icon from '../components/common/Icon.jsx';

const JOURNEY = [
  {
    number: '01',
    title: 'Learn',
    description:
      'Build strong fundamentals through structured concepts, practical examples, and guided lessons.',
    icon: 'book',
  },
  {
    number: '02',
    title: 'Practice',
    description:
      'Turn concepts into skills with quizzes, coding exercises, challenges, and hands-on practice.',
    icon: 'clipboard',
  },
  {
    number: '03',
    title: 'Build',
    description:
      'Apply everything you learn by creating real-world projects and portfolio-ready applications.',
    icon: 'layout',
  },
  {
    number: '04',
    title: 'Ship',
    description:
      'Move from learning to execution by completing projects and building confidence as a developer.',
    icon: 'rocket',
  },
];

const FEATURES = [
  {
    index: '01',
    title: 'Structured Learning',
    description:
      'Courses are organized into modules, topics, concepts, and resources so you always know what to learn next.',
  },
  {
    index: '02',
    title: 'Hands-on Practice',
    description:
      'Go beyond watching lessons with quizzes, coding exercises, and practical challenges.',
  },
  {
    index: '03',
    title: 'Track Your Progress',
    description:
      'Monitor course progress and completed learning activities from your personal dashboard.',
  },
  {
    index: '04',
    title: 'AI-Assisted Learning',
    description:
      'Use the built-in AI experience to understand concepts, get hints, practice, and improve your code.',
  },
];

function SectionLabel({ children }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px w-8 bg-[#ff3e00]" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff3e00]">
        {children}
      </span>
    </div>
  );
}

function ArrowLink({ children, to }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:text-[#ff3e00]"
    >
      {children}
      <Icon
        name="arrow-right"
        className="size-4 transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}

function HeroCodeWindow() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute -inset-6 bg-[#ff3e00]/5 blur-3xl" />

      <div className="relative overflow-hidden border border-[#2a2a2a] bg-[#0f0f0f] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
        <div className="flex h-11 items-center justify-between border-b border-[#2a2a2a] px-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#3a3a3a]" />
            <span className="size-2 rounded-full bg-[#3a3a3a]" />
            <span className="size-2 rounded-full bg-[#3a3a3a]" />
          </div>

          <span className="font-mono text-[10px] uppercase tracking-widest text-[#666]">
            learning.js
          </span>

          <span className="font-mono text-[10px] text-[#555]">
            01
          </span>
        </div>

        <div className="grid min-h-[340px] grid-cols-[42px_1fr] py-5 font-mono text-[12px] leading-7 sm:min-h-[380px] sm:text-[13px]">
          <div className="select-none border-r border-[#222] pr-3 text-right text-[#444]">
            {Array.from({ length: 13 }, (_, index) => (
              <div key={index}>{String(index + 1).padStart(2, '0')}</div>
            ))}
          </div>

          <div className="pl-5 text-[#9a9a9a]">
            <div>
              <span className="text-[#ff7a52]">const</span>{' '}
              <span className="text-white">developer</span>{' '}
              = {'{'}
            </div>

            <div className="pl-5">
              <span className="text-[#ff7a52]">skills</span>:{' '}
              <span className="text-[#d4d4d4]">[]</span>,
            </div>

            <div className="pl-5">
              <span className="text-[#ff7a52]">projects</span>:{' '}
              <span className="text-[#d4d4d4]">[]</span>,
            </div>

            <div className="pl-5">
              <span className="text-[#ff7a52]">confidence</span>:{' '}
              <span className="text-[#d4d4d4]">0</span>,
            </div>

            <div>{'}'}</div>

            <div className="mt-3">
              <span className="text-[#ff7a52]">function</span>{' '}
              <span className="text-white">learnToBuild</span>() {'{'}
            </div>

            <div className="pl-5">
              <span className="text-[#ff7a52]">while</span>{' '}
              <span className="text-[#d4d4d4]">(curious)</span> {'{'}
            </div>

            <div className="pl-10">
              developer.<span className="text-white">learn</span>();
            </div>

            <div className="pl-10">
              developer.<span className="text-white">practice</span>();
            </div>

            <div className="pl-10">
              developer.<span className="text-white">build</span>();
            </div>

            <div className="pl-5">{'}'}</div>

            <div>{'}'}</div>

            <div className="mt-3 text-[#555]">
              // learn → practice → build → ship
            </div>

            <div className="mt-1">
              <span className="text-[#22c55e]">●</span>{' '}
              <span className="text-[#777]">ready to build</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden border border-[#2a2a2a] bg-[#111] px-4 py-3 sm:block">
        <div className="font-mono text-[9px] uppercase tracking-widest text-[#666]">
          status
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-white">
          <span className="size-1.5 rounded-full bg-[#22c55e]" />
          BUILD MODE
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <Link
      to={ROUTES.course(course.id)}
      className="group block h-full overflow-hidden border border-[#292929] bg-[#111] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff3e00]/60"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#171717]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_70%_30%,rgba(255,62,0,0.18),transparent_35%),#171717]">
            <span className="font-mono text-5xl font-bold text-[#292929]">
              /
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-sm">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white">
            {course.level || 'COURSE'}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="flex min-h-[190px] flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff3e00]">
            {course.category || 'DEVELOPMENT'}
          </span>

          <Icon
            name="arrow-right"
            className="size-4 text-[#555] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#ff3e00]"
          />
        </div>

        <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#888]">
          {course.shortDescription ||
            'Build practical skills through structured learning and hands-on practice.'}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#242424] pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Explore course
          </span>

          <span className="text-xs text-[#666] transition-colors group-hover:text-white">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

function CourseSection() {
  const { status, data, error, reload } = useCourses({
    page: 1,
    search: '',
  });

  const courses = data?.items?.slice(0, 3) ?? [];

  return (
    <section className="border-y border-[#202020] bg-[#0d0d0d] py-20 sm:py-28">
      <div className="lms-container">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>Featured learning</SectionLabel>

            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Learn something.
              <br />
              <span className="text-[#555]">Then build something.</span>
            </h2>
          </div>

          <ArrowLink to={ROUTES.courses}>
            View all courses
          </ArrowLink>
        </div>

        {status === REQUEST_STATUS.LOADING && (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-[390px] animate-pulse border border-[#222] bg-[#111]"
              />
            ))}
          </div>
        )}

        {status === REQUEST_STATUS.ERROR && (
          <div className="border border-[#3a2520] bg-[#14100f] p-6">
            <div className="font-mono text-xs uppercase tracking-widest text-[#ff3e00]">
              Courses unavailable
            </div>

            <p className="mt-2 max-w-lg text-sm leading-6 text-[#888]">
              We couldn't load the featured courses right now. The rest of the
              learning platform is still available.
            </p>

            <button
              type="button"
              onClick={reload}
              className="mt-5 border border-[#444] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-white transition-colors hover:border-[#ff3e00] hover:text-[#ff3e00]"
            >
              Try again
            </button>
          </div>
        )}

        {status === REQUEST_STATUS.SUCCESS && courses.length === 0 && (
          <div className="border border-[#242424] bg-[#111] p-10 text-center">
            <div className="font-mono text-xs uppercase tracking-widest text-[#555]">
              No courses yet
            </div>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777]">
              Courses will appear here once they become available.
            </p>
          </div>
        )}

        {status === REQUEST_STATUS.SUCCESS && courses.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsSection({ courseCount }) {
  const stats = [
    {
      value: courseCount ?? '—',
      label: 'Courses available',
    },
    {
      value: '01',
      label: 'Learning platform',
    },
    {
      value: '∞',
      label: 'Things to build',
    },
    {
      value: '24/7',
      label: 'Learn at your pace',
    },
  ];

  return (
    <section className="border-y border-[#242424] bg-[#111]">
      <div className="lms-container grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-5 py-8 sm:px-8 sm:py-10 ${
              index !== 0 ? 'border-l border-[#242424]' : ''
            }`}
          >
            <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {stat.value}
            </div>

            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#666] sm:text-[10px]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="lms-container">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionLabel>The process</SectionLabel>

            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              A learning system built around{' '}
              <span className="text-[#555]">doing.</span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#777]">
              Don't just collect tutorials. Build a repeatable workflow:
              understand the concept, practice it, build with it, and ship
              something real.
            </p>
          </div>

          <div className="border-t border-[#292929]">
            {JOURNEY.map((item) => (
              <div
                key={item.number}
                className="group grid gap-5 border-b border-[#292929] py-7 sm:grid-cols-[60px_50px_1fr] sm:items-start"
              >
                <span className="font-mono text-xs text-[#444]">
                  {item.number}
                </span>

                <Icon
                  name={item.icon}
                  className="size-5 text-[#555] transition-colors group-hover:text-[#ff3e00]"
                />

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#777]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-[#111] py-20 sm:py-28">
      <div className="lms-container">
        <div className="mb-12">
          <SectionLabel>Why this platform</SectionLabel>

          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Everything you need to move from{' '}
            <span className="text-[#555]">concept to code.</span>
          </h2>
        </div>

        <div className="grid border-l border-t border-[#292929] sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.index}
              className="group min-h-[230px] border-b border-r border-[#292929] p-7 transition-colors hover:bg-[#151515] sm:p-9"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] text-[#444]">
                  {feature.index}
                </span>

                <span className="size-2 border border-[#555] transition-colors group-hover:border-[#ff3e00] group-hover:bg-[#ff3e00]" />
              </div>

              <h3 className="mt-14 text-2xl font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#777]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="lms-container">
        <div className="grid overflow-hidden border border-[#292929] bg-[#111] lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <SectionLabel>Built for developers</SectionLabel>

            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Learn in the same environment where you{' '}
              <span className="text-[#555]">build.</span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#777]">
              Follow structured courses, practice concepts, complete quizzes,
              solve coding exercises, track progress, and use AI-assisted
              learning tools without leaving the platform.
            </p>

            <div className="mt-8">
              <ArrowLink to={ROUTES.courses}>
                Explore the platform
              </ArrowLink>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden border-t border-[#292929] bg-[#0a0a0a] lg:border-l lg:border-t-0">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#242424_1px,transparent_1px),linear-gradient(90deg,#242424_1px,transparent_1px)] [background-size:40px_40px]" />

            <div className="absolute left-8 top-8 border border-[#303030] bg-[#111] p-5 font-mono text-xs text-[#777]">
              <div className="mb-3 text-[#444]">
                ~/learning/current
              </div>

              <div>
                <span className="text-[#ff3e00]">course</span>
                <span className="text-white"> → </span>
                <span>module</span>
              </div>

              <div>
                <span className="text-[#ff3e00]">module</span>
                <span className="text-white"> → </span>
                <span>topic</span>
              </div>

              <div>
                <span className="text-[#ff3e00]">topic</span>
                <span className="text-white"> → </span>
                <span>concept</span>
              </div>

              <div>
                <span className="text-[#ff3e00]">concept</span>
                <span className="text-white"> → </span>
                <span>build</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 border border-[#303030] bg-[#151515] p-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#555]">
                Progress
              </div>

              <div className="mt-3 h-1 w-40 bg-[#292929]">
                <div className="h-full w-[68%] bg-[#ff3e00]" />
              </div>

              <div className="mt-2 font-mono text-[10px] text-[#777]">
                68% COMPLETE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { status, data } = useCourses({
    page: 1,
    search: '',
  });

  const courseCount =
    status === REQUEST_STATUS.SUCCESS
      ? data?.pagination?.total
      : null;

  return (
    <div className="overflow-hidden bg-[#0a0a0a] text-white">
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-72px)] border-b border-[#202020]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#202020_1px,transparent_1px),linear-gradient(90deg,#202020_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

        <div className="lms-container relative flex min-h-[calc(100vh-72px)] items-center py-20 sm:py-28">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <div className="mb-7 inline-flex items-center gap-3 border border-[#292929] bg-[#111] px-3 py-2">
                <span className="size-1.5 rounded-full bg-[#ff3e00]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777]">
                  Learn. Practice. Build.
                </span>
              </div>

              <h1 className="max-w-4xl text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
                BUILD
                <br />
                <span className="text-[#555]">YOUR</span>
                <br />
                <span className="text-[#ff3e00]">SKILLS.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-[#888] sm:text-lg">
                A practical learning platform for developers who want to
                understand the fundamentals, write real code, and build
                projects that actually work.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={ROUTES.courses}
                  className="inline-flex h-12 items-center justify-center gap-3 bg-[#ff3e00] px-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#ff5420] hover:shadow-[0_0_35px_rgba(255,62,0,0.2)]"
                >
                  Explore Courses
                  <Icon name="arrow-right" className="size-4" />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center border border-[#353535] px-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-[#777] hover:bg-[#151515]"
                >
                  Start Learning
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-widest text-[#555]">
                <span>Structured courses</span>
                <span>•</span>
                <span>Hands-on practice</span>
                <span>•</span>
                <span>AI assisted</span>
              </div>
            </div>

            <HeroCodeWindow />
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsSection courseCount={courseCount} />

      {/* COURSES */}
      <CourseSection />

      {/* JOURNEY */}
      <JourneySection />

      {/* FEATURES */}
      <FeaturesSection />

      {/* EXPERIENCE */}
      <ExperienceSection />

      {/* FINAL CTA */}
      <section className="border-t border-[#242424] py-24 sm:py-32">
        <div className="lms-container">
          <div className="relative overflow-hidden border border-[#292929] bg-[#111] px-7 py-14 sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#ff3e00]/10 blur-3xl" />

            <div className="relative max-w-4xl">
              <SectionLabel>Ready when you are</SectionLabel>

              <h2 className="text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                STOP
                <br />
                <span className="text-[#555]">JUST WATCHING.</span>
                <br />
                START BUILDING.
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-[#777] sm:text-base">
                Choose a course, learn the concepts, practice the skills, and
                turn what you know into something you can actually build.
              </p>

              <div className="mt-9">
                <Link
                  to={ROUTES.courses}
                  className="inline-flex h-12 items-center gap-3 bg-[#ff3e00] px-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#ff5420]"
                >
                  Browse Courses
                  <Icon name="arrow-right" className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#202020] bg-[#080808]">
        <div className="lms-container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-sm font-bold tracking-[0.2em] text-white">
              LMS<span className="text-[#ff3e00]">.</span>
            </div>

            <div className="mt-2 text-xs text-[#555]">
              Learn. Practice. Build. Ship.
            </div>
          </div>

          <div className="flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-widest text-[#555]">
            <Link
              to={ROUTES.courses}
              className="transition-colors hover:text-white"
            >
              Courses
            </Link>

            <Link
              to="/login"
              className="transition-colors hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="transition-colors hover:text-white"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}