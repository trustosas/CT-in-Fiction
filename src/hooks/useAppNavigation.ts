import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character } from '../data';
import { slugify } from '../lib/ct-logic';

export type View = 'medium' | 'work' | 'feed';

export function useAppNavigation(characters: Character[]) {
  const { mediumSlug, workSlug, subjectSlug } = useParams();
  const navigate = useNavigate();

  const activeMedium = useMemo(() => {
    if (!mediumSlug) return null;
    const char = characters.find(c => slugify(c.medium) === mediumSlug);
    return char ? char.medium : null;
  }, [mediumSlug, characters]);

  const activeWork = useMemo(() => {
    if (!workSlug) return null;
    const char = characters.find(c => slugify(c.source) === workSlug);
    return char ? char.source : null;
  }, [workSlug, characters]);

  const activeSubject = useMemo(() => {
    if (!subjectSlug) return null;
    return characters.find(c => slugify(c.name) === subjectSlug);
  }, [subjectSlug, characters]);

  const currentView: View = useMemo(() => {
    if (workSlug) return 'work';
    if (mediumSlug) return 'medium';
    return 'feed';
  }, [mediumSlug, workSlug]);

  const navigateToFeed = () => navigate('/');
  const navigateToMedium = (medium: string) => navigate(`/${slugify(medium)}`);
  const navigateToWork = (medium: string, work: string) => navigate(`/${slugify(medium)}/${slugify(work)}`);
  const navigateToSubject = (medium: string, work: string, name: string) => 
    navigate(`/${slugify(medium)}/${slugify(work)}/${slugify(name)}`);

  return {
    mediumSlug,
    workSlug,
    subjectSlug,
    activeMedium,
    activeWork,
    activeSubject,
    currentView,
    navigateToFeed,
    navigateToMedium,
    navigateToWork,
    navigateToSubject
  };
}
