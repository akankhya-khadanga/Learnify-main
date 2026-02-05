import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { EligibilityPanel } from '@/components/schemes/EligibilityPanel';
import { SchemeFilters } from '@/components/schemes/SchemeFilters';
import { SmartAutoFillPanel } from '@/components/schemes/SmartAutoFillPanel';
import { SchemeLoadingGrid } from '@/components/schemes/SchemeLoadingSkeleton';
import { SchemesEmptyState } from '@/components/schemes/SchemesEmptyState';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import RecommendationFeed from '@/components/opportunities/RecommendationFeed';
import AutoApplicationModal from '@/components/opportunities/AutoApplicationModal';
import OpportunityCardSkeleton from '@/components/opportunities/OpportunityCardSkeleton';
import OpportunitiesEmptyState from '@/components/opportunities/OpportunitiesEmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MOCK_SCHEMES,
  getRecommendedSchemes,
  getSchemesByCategory,
  getActiveSchemes,
  SchemeCategory,
  EducationLevel
} from '@/mocks/schemes';
import {
  OpportunityCategory,
  MOCK_OPPORTUNITIES,
  getOpportunitiesByCategory,
  getHighMatchOpportunities,
  Opportunity
} from '@/mocks/opportunities';
import {
  Award,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  Briefcase,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OpportunityTabOption = 'ALL' | OpportunityCategory;

export default function Opportunities() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main tab state (Schemes vs Smart Opportunities)
  const [activeMainTab, setActiveMainTab] = useState<'schemes' | 'opportunities'>('schemes');

  // Schemes state
  const [isLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | 'ALL'>('ALL');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevel | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState<string | 'ALL'>('ALL');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  // Opportunities state
  const [activeOpportunityTab, setActiveOpportunityTab] = useState<OpportunityTabOption>('ALL');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpportunityLoading, setIsOpportunityLoading] = useState(false);

  // Schemes data
  const recommendedSchemes = useMemo(() => getRecommendedSchemes(), []);
  const activeSchemes = useMemo(() => getActiveSchemes(), []);

  const filteredSchemes = useMemo(() => {
    let schemes = activeSchemes;

    if (selectedCategory !== 'ALL') {
      schemes = schemes.filter(s => s.category === selectedCategory);
    }

    if (selectedEducationLevel !== 'ALL') {
      schemes = schemes.filter(s =>
        s.educationLevel === selectedEducationLevel || s.educationLevel === 'ALL'
      );
    }

    if (selectedState !== 'ALL') {
      schemes = schemes.filter(s =>
        !s.state || s.state === selectedState || s.state === 'Various States'
      );
    }

    return schemes;
  }, [activeSchemes, selectedCategory, selectedEducationLevel, selectedState]);

  const meritBasedSchemes = useMemo(() =>
    getSchemesByCategory('MERIT_BASED').filter(s => s.status === 'ACTIVE'),
    []
  );

  const financialAidSchemes = useMemo(() =>
    [...getSchemesByCategory('FINANCIAL_AID'), ...getSchemesByCategory('FEE_WAIVER')]
      .filter(s => s.status === 'ACTIVE'),
    []
  );

  const careerProgramSchemes = useMemo(() =>
    getSchemesByCategory('CAREER_PROGRAM').filter(s => s.status === 'ACTIVE'),
    []
  );

  // Opportunities data
  const opportunityTabs: { id: OpportunityTabOption; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'SCHOLARSHIP', label: 'Scholarships' },
    { id: 'SCHEME', label: 'Gov Schemes' },
    { id: 'COMPETITION', label: 'Competitions' },
    { id: 'INTERNSHIP', label: 'Internships' },
    { id: 'GRANT', label: 'Grants' }
  ];

  const displayedOpportunities =
    activeOpportunityTab === 'ALL'
      ? MOCK_OPPORTUNITIES
      : getOpportunitiesByCategory(activeOpportunityTab as OpportunityCategory);

  const topRecommendations = getHighMatchOpportunities();

  // Handlers
  const handleCheckEligibility = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setTimeout(() => {
      const panel = document.getElementById('eligibility-panel');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedEducationLevel('ALL');
    setSelectedState('ALL');
  };

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedEducationLevel !== 'ALL' ||
    selectedState !== 'ALL';

  const handleAutoJudge = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsModalOpen(true);
  };

  const handleAutoApply = () => {
    toast({
      title: 'Application Started! 🚀',
      description: `Auto-applying for ${selectedOpportunity?.title}. You'll be notified when ready for review.`,
      duration: 5000
    });
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    toast({
      title: 'Opening Application Portal',
      description: `Redirecting to ${opportunity.provider}...`,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-black text-white">Opportunities Center</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Scholarships, schemes, competitions & more
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg px-4 py-2 border border-neon/30">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-gray-400">Your Match Score</p>
                <p className="text-lg font-black text-white">92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 pb-4">
            <button
              onClick={() => setActiveMainTab('schemes')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeMainTab === 'schemes'
                  ? 'bg-primary text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <GraduationCap className="w-4 h-4" />
              Government Schemes
            </button>
            <button
              onClick={() => setActiveMainTab('opportunities')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeMainTab === 'opportunities'
                  ? 'bg-primary text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Trophy className="w-4 h-4" />
              Smart Opportunities
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeMainTab === 'schemes' ? (
          <motion.div
            key="schemes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-6 py-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Filters */}
                <SchemeFilters
                  selectedCategory={selectedCategory}
                  selectedEducationLevel={selectedEducationLevel}
                  selectedState={selectedState}
                  onCategoryChange={setSelectedCategory}
                  onEducationLevelChange={setSelectedEducationLevel}
                  onStateChange={setSelectedState}
                />

                {/* Recommended Section */}
                {recommendedSchemes.length > 0 && !hasActiveFilters && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Top Matches
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {recommendedSchemes.slice(0, 3).map((scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          onCheckEligibility={handleCheckEligibility}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* All Filtered Schemes */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#6DAEDB]" />
                      <h2 className="text-2xl font-bold text-white">
                        {hasActiveFilters ? 'Filtered Results' : 'All Schemes'}
                      </h2>
                    </div>
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-white">
                      {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'}
                    </Badge>
                  </div>

                  {isLoading ? (
                    <SchemeLoadingGrid />
                  ) : filteredSchemes.length === 0 ? (
                    <SchemesEmptyState
                      hasFilters={hasActiveFilters}
                      onClearFilters={clearAllFilters}
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredSchemes.map((scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          onCheckEligibility={handleCheckEligibility}
                        />
                      ))}
                    </div>
                  )}
                </motion.section>

                {/* Merit-Based Section */}
                {meritBasedSchemes.length > 0 && !hasActiveFilters && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold text-white">Merit-Based Opportunities</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {meritBasedSchemes.slice(0, 4).map((scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          onCheckEligibility={handleCheckEligibility}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Financial Aid Section */}
                {financialAidSchemes.length > 0 && !hasActiveFilters && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Financial Aid & Fee Waivers</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {financialAidSchemes.slice(0, 4).map((scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          onCheckEligibility={handleCheckEligibility}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Career Programs Section */}
                {careerProgramSchemes.length > 0 && !hasActiveFilters && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-accent-500" />
                        <h2 className="text-2xl font-bold text-white">Government Career Programs</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {careerProgramSchemes.map((scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          onCheckEligibility={handleCheckEligibility}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* Eligibility Panel */}
                <div id="eligibility-panel">
                  <EligibilityPanel
                    schemeId={selectedSchemeId}
                    onClose={() => setSelectedSchemeId(null)}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Smart Auto-Fill Panel */}
                <SmartAutoFillPanel />

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-white">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Your Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-sm text-gray-400">Applications Started</span>
                          <Badge variant="secondary">3</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-sm text-gray-400">Eligible Schemes</span>
                          <Badge variant="secondary">{recommendedSchemes.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-sm text-gray-400">Deadlines This Month</span>
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                            5
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700 text-white hover:bg-white/10" size="sm">
                        View Application History
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Help Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#6DAEDB]/10 to-transparent">
                    <CardContent className="pt-6 space-y-3">
                      <h3 className="font-semibold text-white">Need Help?</h3>
                      <p className="text-sm text-gray-400">
                        Our AI assistant can help you find the best schemes and guide you through the application process.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-slate-200 dark:border-slate-700 text-white hover:bg-[#6DAEDB]/20 hover:border-[#6DAEDB]"
                        size="sm"
                        onClick={() => navigate('/ai-bot')}
                      >
                        Chat with AI Assistant
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Opportunity Sub-Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700 bg-black/30">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                  {opportunityTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOpportunityTab(tab.id)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${activeOpportunityTab === tab.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  {isOpportunityLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <OpportunityCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : displayedOpportunities.length === 0 ? (
                    <OpportunitiesEmptyState />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayedOpportunities.map((opportunity, index) => (
                        <motion.div
                          key={opportunity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <OpportunityCard
                            opportunity={opportunity}
                            onAutoJudge={handleAutoJudge}
                            onViewDetails={handleViewDetails}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <RecommendationFeed
                      opportunities={topRecommendations}
                      onSelect={opportunity => {
                        setSelectedOpportunity(opportunity);
                        setIsModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto Application Modal */}
      <AutoApplicationModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOpportunity(null);
        }}
        onSubmit={handleAutoApply}
      />
    </div>
  );
}
