import crossLinks from './crossLinks.json';
import { chaptersData } from './chapters';

export interface CrossLink {
  href: string;
  label: string;
}

const appendixSlugs = Object.keys(crossLinks.appendices);
const lessonAppendices: Record<string, string[]> = crossLinks.lessonAppendices;

// Fail the build on a typo instead of shipping a dead link.
for (const [chapterId, slugs] of Object.entries(lessonAppendices)) {
  if (!chaptersData[chapterId]) throw new Error(`crossLinks.json: unknown chapter "${chapterId}"`);
  for (const slug of slugs) {
    if (!appendixSlugs.includes(slug)) throw new Error(`crossLinks.json: unknown appendix "${slug}" on "${chapterId}"`);
  }
}

function appendixLink(slug: string): CrossLink {
  const number = String(appendixSlugs.indexOf(slug) + 1).padStart(2, '0');
  const title = crossLinks.appendices[slug as keyof typeof crossLinks.appendices];
  return { href: `/${slug}`, label: `Appendix ${number}: ${title}` };
}

export function relatedAppendices(chapterId: string): CrossLink[] {
  return (lessonAppendices[chapterId] ?? []).map(appendixLink);
}

// The reverse direction: every lesson that points at this appendix, in curriculum order.
export function foundationalLessons(appendixSlug: string): CrossLink[] {
  const lessonIds = Object.keys(chaptersData).filter((chapterId) => lessonAppendices[chapterId]?.includes(appendixSlug));
  if (lessonIds.length === 0) throw new Error(`crossLinks.json: no lesson links to appendix "${appendixSlug}"`);
  return lessonIds.map((chapterId) => {
    const chapter = chaptersData[chapterId];
    return { href: `/chapter/${chapterId}`, label: `Chapter ${chapter.num}: ${chapter.title}` };
  });
}

export const lessonCrossLinks: Record<string, CrossLink[]> = Object.fromEntries(
  Object.keys(chaptersData).map((chapterId) => [chapterId, relatedAppendices(chapterId)]),
);
