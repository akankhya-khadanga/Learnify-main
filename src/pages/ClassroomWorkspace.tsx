import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  ExternalLink,
  RefreshCw,
  Loader2,
  Split,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleClassroom } from '@/hooks/useGoogleClassroom';
import { TranslatedText } from '@/components/TranslatedText';

export default function ClassroomWorkspace() {
  const navigate = useNavigate();
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const {
    assignments,
    courses: classroomCourses,
    materials,
    loading: classroomLoading,
    error: classroomError,
    isConnected,
    connectAndSync,
    refreshAssignments,
    disconnect,
  } = useGoogleClassroom();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9B458]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C27BA0]/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b-4 border-[#C9B458] bg-black/50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/workspace-view')}
                variant="ghost"
                className="text-white hover:text-[#C9B458]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <TranslatedText text="Back to Workspaces" />
              </Button>
              <div className="h-8 w-px bg-[#C9B458]/30" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#C9B458] to-[#C27BA0] rounded-lg flex items-center justify-center border-4 border-black">
                  <GraduationCap className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#C9B458] to-[#C27BA0]">
                    <TranslatedText text="SCHOOL WORKLIST" />
                  </h1>
                  <p className="text-sm text-white/60 font-bold">
                    <TranslatedText text="Google Classroom Integration" />
                  </p>
                </div>
              </div>
            </div>

            {isConnected && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowAllAssignments(!showAllAssignments)}
                  className="bg-[#C9B458] text-black font-black border-4 border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
                >
                  <Split className="w-4 h-4 mr-2" />
                  <TranslatedText text={showAllAssignments ? 'Classes' : 'Assignments'} />
                </Button>
                <Button
                  onClick={refreshAssignments}
                  disabled={classroomLoading}
                  className="bg-white text-black font-black border-4 border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                >
                  {classroomLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <TranslatedText text="Syncing..." />
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <TranslatedText text="Sync" />
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    disconnect();
                    window.location.reload();
                  }}
                  className="bg-red-500 text-white font-black border-4 border-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all"
                >
                  <X className="w-4 h-4 mr-2" />
                  <TranslatedText text="Disconnect" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {classroomError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 border-4 border-red-500 bg-red-900/20 p-4 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-200 font-bold">{classroomError}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isConnected ? (
            // Connection Card
            <motion.div
              key="connect"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-4 border-[#C9B458] shadow-[8px_8px_0_0_rgba(201,180,88,0.3)] bg-gradient-to-br from-black to-gray-900">
                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-24 h-24 bg-gradient-to-r from-[#C9B458] to-[#C27BA0] rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-black"
                  >
                    <GraduationCap className="w-14 h-14 text-black" />
                  </motion.div>
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#C9B458] to-[#C27BA0] mb-3">
                    <TranslatedText text="Connect Google Classroom" />
                  </h3>
                  <p className="text-white/70 font-bold text-lg mb-8">
                    <TranslatedText text="Sync your school assignments and stay organized" />
                  </p>
                  <Button
                    onClick={connectAndSync}
                    size="lg"
                    className="bg-gradient-to-r from-[#C9B458] to-[#C27BA0] text-black font-black px-8 py-6 text-lg rounded-lg border-4 border-black hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
                  >
                    <ExternalLink className="w-6 h-6 mr-3" />
                    <TranslatedText text="Connect Now" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : showAllAssignments ? (
            // Assignment Kanban View
            <motion.div
              key="assignments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Pending Column */}
              <div className="bg-red-900/20 border-4 border-red-500 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
                  <h3 className="text-red-400 font-black uppercase text-lg">
                    <TranslatedText text="Pending" />
                  </h3>
                  <Badge className="bg-red-500 text-white border-2 border-black">
                    {assignments.pending.length}
                  </Badge>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {assignments.pending.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-3 border-red-500 bg-black/50 hover:shadow-[4px_4px_0_0_rgba(239,68,68,1)] transition-all">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-black text-white mb-2">{assignment.title}</h4>
                          <p className="text-xs text-red-300 mb-2">{assignment.courseName}</p>
                          {assignment.dueDateTime && (
                            <div className="flex items-center gap-1 text-xs text-red-400 font-bold mb-3">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(assignment.dueDateTime).toLocaleDateString()}
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => window.open(assignment.alternateLink, '_blank')}
                            className="w-full bg-red-500 text-white font-bold border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            <TranslatedText text="Open Assignment" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {assignments.pending.length === 0 && (
                    <p className="text-red-400/50 text-sm text-center py-8">
                      <TranslatedText text="No pending assignments" />
                    </p>
                  )}
                </div>
              </div>

              {/* Upcoming Column */}
              <div className="bg-yellow-900/20 border-4 border-yellow-500 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-black" />
                  <h3 className="text-yellow-400 font-black uppercase text-lg">
                    <TranslatedText text="Upcoming" />
                  </h3>
                  <Badge className="bg-yellow-500 text-black border-2 border-black">
                    {assignments.upcoming.length}
                  </Badge>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {assignments.upcoming.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-3 border-yellow-500 bg-black/50 hover:shadow-[4px_4px_0_0_rgba(234,179,8,1)] transition-all">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-black text-white mb-2">{assignment.title}</h4>
                          <p className="text-xs text-yellow-300 mb-2">{assignment.courseName}</p>
                          {assignment.dueDateTime && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold mb-3">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(assignment.dueDateTime).toLocaleDateString()}
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => window.open(assignment.alternateLink, '_blank')}
                            className="w-full bg-yellow-500 text-black font-bold border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            <TranslatedText text="Open Assignment" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {assignments.upcoming.length === 0 && (
                    <p className="text-yellow-400/50 text-sm text-center py-8">
                      <TranslatedText text="No upcoming assignments" />
                    </p>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="bg-green-900/20 border-4 border-green-500 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                  <h3 className="text-green-400 font-black uppercase text-lg">
                    <TranslatedText text="Completed" />
                  </h3>
                  <Badge className="bg-green-500 text-black border-2 border-black">
                    {assignments.completed.length}
                  </Badge>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {assignments.completed.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-3 border-green-500 bg-black/50 opacity-75 hover:opacity-100 transition-all">
                        <CardContent className="p-4">
                          <h4 className="text-sm font-black text-white mb-2">{assignment.title}</h4>
                          <p className="text-xs text-green-300 mb-2">{assignment.courseName}</p>
                          <div className="flex items-center gap-1 text-xs text-green-400 font-bold mb-3">
                            <CheckCircle className="w-3 h-3" />
                            <TranslatedText text="Turned In" />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => window.open(assignment.alternateLink, '_blank')}
                            className="w-full bg-green-500 text-black font-bold border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            <TranslatedText text="View Submission" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {assignments.completed.length === 0 && (
                    <p className="text-green-400/50 text-sm text-center py-8">
                      <TranslatedText text="No completed assignments" />
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            // Classes Grid View
            <motion.div
              key="classes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {classroomCourses.map((course) => {
                const courseMaterials = materials[course.id] || [];
                const isExpanded = selectedClassId === course.id;

                return (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={isExpanded ? 'col-span-full' : ''}
                  >
                    <Card
                      onClick={() => setSelectedClassId(isExpanded ? null : course.id)}
                      className={`border-4 ${
                        isExpanded ? 'border-[#C27BA0]' : 'border-[#C9B458]'
                      } bg-gradient-to-br from-black to-gray-900 cursor-pointer hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#C9B458] to-[#C27BA0] rounded-lg flex items-center justify-center border-2 border-black">
                            <GraduationCap className="w-6 h-6 text-black" />
                          </div>
                          <CardTitle className="text-lg font-black text-white">
                            {course.name}
                          </CardTitle>
                        </div>
                        {course.section && (
                          <CardDescription className="text-white/60 font-bold">
                            Section: {course.section}
                          </CardDescription>
                        )}
                        <Badge className="bg-[#C9B458] text-black font-black border-2 border-black mt-2 w-fit">
                          {courseMaterials.length} Materials
                        </Badge>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="p-6 pt-0">
                          {courseMaterials.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {courseMaterials.map((material) => (
                                <Card
                                  key={material.id}
                                  className="border-3 border-[#C27BA0] bg-black/50"
                                >
                                  <CardHeader className="pb-2 p-4">
                                    <CardTitle className="text-xs font-black text-[#C27BA0]">
                                      {material.title}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0 space-y-2">
                                    {material.materials?.map((item, idx) => {
                                      const link =
                                        item.driveFile?.driveFile?.alternateLink ||
                                        item.link?.url ||
                                        item.youtubeVideo?.alternateLink ||
                                        item.form?.formUrl;
                                      const title =
                                        item.driveFile?.driveFile?.title ||
                                        item.link?.title ||
                                        item.youtubeVideo?.title ||
                                        item.form?.title ||
                                        'Open';
                                      return link ? (
                                        <Button
                                          key={idx}
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(link, '_blank');
                                          }}
                                          className="w-full bg-[#C27BA0] text-black font-bold text-xs border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          {title}
                                        </Button>
                                      ) : null;
                                    })}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/50 text-center py-8">
                              <TranslatedText text="No materials available" />
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
              {classroomCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-white/50 text-lg">
                    <TranslatedText text="No classes found. Try syncing again." />
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
