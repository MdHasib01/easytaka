import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Play, CheckCircle2, Award, BookOpen, Sparkles } from 'lucide-react';
import { coursesApi } from '../../api/endpoints';
import { CourseModule } from '../../types';

export const SMMAcademyPage: React.FC = () => {
  const { showToast, triggerConfetti, setLevelUpModalOpen } = useApp();
  const [courses, setCourses] = useState<CourseModule[]>([]);
  const [activeCourse, setActiveCourse] = useState<CourseModule | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    coursesApi
      .list()
      .then((rows) => !cancelled && setCourses(rows))
      .catch(() => showToast('Could not load academy modules', 'error'));
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  /**
   * XP is awarded server-side and only on the first pass — the mock announced
   * "+200 XP" in a toast string and never changed the user's actual XP.
   */
  const handleCompleteCourse = async (course: CourseModule) => {
    try {
      await coursesApi.setProgress(course.id, course.totalLessons);
      const updated = await coursesApi.list();
      setCourses(updated);
      showToast(`🎓 Module Completed! Take the quiz to bank the +${course.xpReward ?? 0} XP.`, 'success');
      triggerConfetti();
      setActiveCourse(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update progress', 'error');
    }
  };

  /** Submits every question's first option — a placeholder until a quiz UI exists. */
  const handleTakeQuiz = async (course: CourseModule, answers: number[]) => {
    try {
      const result = await coursesApi.submitQuiz(course.id, answers);
      setCourses(await coursesApi.list());
      if (result.passed) {
        showToast(
          `✅ Passed with ${result.scorePct}% — +${result.xpAwarded} XP credited!`,
          'success'
        );
        triggerConfetti();
        if (result.leveledUp) setLevelUpModalOpen(true);
      } else {
        showToast(`Scored ${result.scorePct}% — ${course.passThresholdPct ?? 85}% needed to pass.`, 'warning');
      }
      setActiveCourse(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit quiz', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            EasyTaka SMM Academy
            <GraduationCap className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Certified skill training modules to unlock higher salary multipliers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(c => (
          <GlassCard key={c.id} glow="purple" className="space-y-4">
            <div className="flex justify-between items-start">
              <Badge variant="primary">{c.category}</Badge>
              {c.isCompleted && <Badge variant="success">Completed</Badge>}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Duration: {c.durationMins} Mins • Reward: +{c.xpReward ?? 0} XP
              </p>
              <p className="text-[11px] text-indigo-300 mt-1">
                {c.completedLessons}/{c.totalLessons} lessons • {c.quizQuestions.length} quiz questions
              </p>
            </div>

            <div
              onClick={() => setActiveCourse(c)}
              className="h-28 bg-slate-900/80 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer"
            >
              <Play className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>

            <Button
              variant={c.isCompleted ? 'secondary' : 'gradient'}
              className="w-full"
              onClick={() => setActiveCourse(c)}
            >
              {c.isCompleted ? 'Review Course' : 'Start Module'}
            </Button>
          </GlassCard>
        ))}
      </div>

      {activeCourse && (
        <Modal
          isOpen={!!activeCourse}
          onClose={() => setActiveCourse(null)}
          title={`Academy Training: ${activeCourse.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="aspect-video bg-slate-950 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Play className="w-12 h-12 text-indigo-400 animate-pulse" />
              <div className="text-sm font-bold text-white">Interactive SMM Module Playing...</div>
              <p className="text-slate-400 max-w-sm">
                Learn brand guidelines, crisis protocol, and copywriting formulas approved by EasyTaka Admin.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 flex justify-between items-center text-slate-300 font-bold">
              <span>Completion XP Reward:</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> +{activeCourse.xpReward ?? 0} XP
              </span>
            </div>

            {activeCourse.quizQuestions.length > 0 && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-200">
                Certification quiz: {activeCourse.quizQuestions.length} questions,{' '}
                {activeCourse.passThresholdPct ?? 85}% to pass. Answers are graded on the server.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setActiveCourse(null)}>
                Close
              </Button>
              {!activeCourse.isCompleted && (
                <Button variant="gradient" onClick={() => handleCompleteCourse(activeCourse)}>
                  Mark Module Completed
                </Button>
              )}
              {activeCourse.quizQuestions.length > 0 && (
                <Button
                  variant="warning"
                  onClick={() => handleTakeQuiz(activeCourse, activeCourse.quizQuestions.map(() => 0))}
                >
                  Submit Certification Quiz
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
