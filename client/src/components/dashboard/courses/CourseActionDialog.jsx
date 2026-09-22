import { useToast } from '../../../hooks/useToast.js';
import { archiveCourse, deleteCourse, publishCourse } from '../../../services/courseService.js';
import ConfirmDialog from '../../common/ConfirmDialog.jsx';

// One confirmation for every course status change. Publish and archive are always explicit here.
// They can never be triggered by submitting the edit form.
const ACTIONS = {
  publish: {
    title: 'Publish this course?',
    confirmLabel: 'Publish',
    pendingLabel: 'Publishing…',
    tone: 'primary',
    run: publishCourse,
    done: 'Course published.',
    body: (course) => (
      <>
        <p>“{course.title}” will become visible to students.</p>
        <p>Modules, topics, concepts and resources that are still drafts stay hidden until they are published too.</p>
      </>
    ),
  },
  archive: {
    title: 'Archive this course?',
    confirmLabel: 'Archive',
    pendingLabel: 'Archiving…',
    tone: 'primary',
    run: archiveCourse,
    done: 'Course archived.',
    body: (course) => <p>“{course.title}” will be hidden from students. You can publish it again later.</p>,
  },
  delete: {
    title: 'Delete this course?',
    confirmLabel: 'Delete',
    pendingLabel: 'Deleting…',
    tone: 'danger',
    run: deleteCourse,
    done: 'Course deleted.',
    body: (course) => (
      <>
        <p>“{course.title}” will be permanently deleted. This action cannot be undone.</p>
        <p>A course that still contains modules can&apos;t be deleted. Remove its modules first.</p>
      </>
    ),
  },
};

export default function CourseActionDialog({ action, course, onClose, onDone }) {
  const { notify } = useToast();
  const config = ACTIONS[action];

  return (
    <ConfirmDialog
      title={config.title}
      confirmLabel={config.confirmLabel}
      pendingLabel={config.pendingLabel}
      tone={config.tone}
      onClose={onClose}
      onConfirm={async () => {
        await config.run(course.id);
        notify(config.done);
        onDone(action);
      }}
    >
      {config.body(course)}
    </ConfirmDialog>
  );
}