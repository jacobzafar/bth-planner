import { StudyEvent, Course, PrioritizedEvent } from './types';

export function calculatePriority(event: StudyEvent, course?: Course): PrioritizedEvent {
  let priority = 0;
  const explanations: string[] = [];

  const now = new Date();
  const due = new Date(`${event.dueDate}T${event.dueTime || '23:59'}`);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Time score
  if (hoursLeft <= 24) {
    priority += 10;
    explanations.push('Due <24h (+10)');
  } else if (hoursLeft <= 72) {
    priority += 7;
    explanations.push('Due <3 days (+7)');
  } else if (hoursLeft <= 168) {
    priority += 5;
    explanations.push('Due <7 days (+5)');
  } else if (hoursLeft <= 336) {
    priority += 3;
    explanations.push('Due <14 days (+3)');
  }

  // Course boost
  if (course?.blocking) {
    priority += 4;
    explanations.push('Blocking course (+4)');
  }
  if (course?.importance === 'high') {
    priority += 2;
    explanations.push('High importance (+2)');
  }

  // Event type
  if (event.type === 'exam') {
    priority += 3;
    explanations.push('Exam (+3)');
  } else if (event.type === 'assignment') {
    priority += 1;
    explanations.push('Assignment (+1)');
  }

  return {
    ...event,
    priority,
    explanation: explanations.join(', ') + ` = ${priority}`,
    course,
  };
}

export function getPrioritizedEvents(events: StudyEvent[], courses: Course[]): PrioritizedEvent[] {
  const courseMap = new Map(courses.map(c => [c.id, c]));
  
  const upcoming = events.filter(e => {
    if (e.status === 'complete') return false;
    const due = new Date(`${e.dueDate}T${e.dueTime || '23:59'}`);
    return due > new Date();
  });

  const prioritized = upcoming.map(e => calculatePriority(e, courseMap.get(e.courseId)));

  // Sort: priority DESC, date ASC, type weight
  const typeWeight = { exam: 0, assignment: 1, lab: 2 };
  prioritized.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return typeWeight[a.type] - typeWeight[b.type];
  });

  return prioritized;
}
