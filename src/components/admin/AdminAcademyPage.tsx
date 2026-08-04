import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ProgressBar } from '../common/ProgressBar';
import { useApp } from '../../context/AppContext';
import { coursesApi } from '../../api/endpoints';
import { CourseModule } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Award, 
  BarChart3, 
  HelpCircle,
  Clock,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export const AdminAcademyPage: React.FC = () => {
  const { showToast } = useApp();
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Create module modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CourseModule['category']>('Maternal Care Branding');
  const [newDuration, setNewDuration] = useState(30);

  React.useEffect(() => {
    let cancelled = false;
    coursesApi
      .list()
      .then((rows) => !cancelled && setModules(rows))
      .catch(() => showToast('Could not load academy modules', 'error'));
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // Quiz builder modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);

  const categories = ['All', 'Maternal Care Branding', 'Viral Growth', 'Compliance & Ethics', 'Onboarding'];

  const filteredModules = modules.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      // assignedCount / passRate are server-owned rollups now; the mock
      // hardcoded them to 12 and 100 on every new module.
      const created = await coursesApi.create({
        title: newTitle,
        category: newCategory,
        durationMins: Number(newDuration),
        totalLessons: 6
      });
      setModules((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      showToast(`🎓 New Academy Module "${created.title}" Published!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create module', 'error');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModule || !questionText || !optionA || !optionB) return;
    try {
      const updated = await coursesApi.addQuestion(activeModule.id, {
        question: questionText,
        options: [optionA, optionB, 'Both A & B', 'None'],
        correctIndex: correctIdx
      });
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setIsQuizModalOpen(false);
      showToast('❓ Quiz Question Added Successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not add question', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Academy & Certification Management
            <GraduationCap className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Create brand guidelines, train SMM personnel, and manage skill certification quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Training Module
          </Button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="purple">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Modules</span>
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{modules.length}</div>
          <p className="text-[11px] text-indigo-300 font-semibold mt-1">4 core skill tracks</p>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Enrolled SMMs</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">87</div>
          <p className="text-[11px] text-cyan-300 font-semibold mt-1">across 12 districts</p>
        </GlassCard>

        <GlassCard glow="emerald">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Pass Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">94.5%</div>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">Minimum 85% to certify</p>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Certificates Issued</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">142</div>
          <p className="text-[11px] text-amber-300 font-semibold mt-1">Boosts SMM Badge Allowance</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search module title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((m) => (
          <GlassCard key={m.id} glow="purple" className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Badge variant="info">{m.category}</Badge>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {m.durationMins} mins
                </span>
              </div>

              <h3 className="text-base font-bold text-white line-clamp-2">{m.title}</h3>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Enrolled SMMs</span>
                  <span className="text-sm font-black text-white">{m.assignedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Quiz Pass Rate</span>
                  <span className="text-sm font-black text-emerald-400">{m.passRate}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Questions Configured</span>
                  <span>{m.quizQuestions.length} Questions</span>
                </div>
                <ProgressBar progress={Math.min(100, (m.quizQuestions.length / 3) * 100)} color="gradient" />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                className="w-full"
                onClick={() => {
                  setActiveModule(m);
                  setIsQuizModalOpen(true);
                }}
                icon={<HelpCircle className="w-3.5 h-3.5 text-indigo-400" />}
              >
                Add Quiz Question
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast(`Retake cleared for module "${m.title}"`, 'info')}
              >
                Retakes
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Create Module Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Training Module"
      >
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Module Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Milkimom Community Moderation Standard"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Skill Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="Maternal Care Branding">Maternal Care Branding</option>
              <option value="Viral Growth">Viral Growth</option>
              <option value="Compliance & Ethics">Compliance & Ethics</option>
              <option value="Onboarding">Onboarding</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Duration (Minutes)</label>
            <input
              type="number"
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Publish Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quiz Builder Modal */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title={`Add Quiz Question (${activeModule?.title})`}
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Question Prompt *</label>
            <input
              type="text"
              required
              placeholder="e.g. What is the mandatory hashtag for Milkimom reels?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Option A</label>
              <input
                type="text"
                required
                placeholder="Option A text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Option B</label>
              <input
                type="text"
                required
                placeholder="Option B text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Correct Answer Index</label>
            <select
              value={correctIdx}
              onChange={(e) => setCorrectIdx(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Option A (Index 0)</option>
              <option value={1}>Option B (Index 1)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsQuizModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
