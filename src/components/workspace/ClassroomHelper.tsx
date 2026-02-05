/**
 * Production Classroom Helper (Google Classroom Integration)
 * 
 * PRODUCTION FEATURES:
 * - Real Google Classroom API integration
 * - OAuth authentication with Google
 * - Fetches actual courses, assignments, and submissions
 * - Syncs with user's Google Classroom account
 * - Shows pending, upcoming, and completed assignments
 * - Displays all enrolled courses
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, CheckCircle, Circle, Clock, AlertCircle, Loader2, RefreshCw, LogOut } from 'lucide-react';
import { useGoogleClassroom } from '@/hooks/useGoogleClassroom';
import type { Helper, Space } from '@/types/unifiedOS';

interface ClassroomHelperProps {
  helper: Helper;
  space: Space;
}

export default function ClassroomHelper({ helper, space }: ClassroomHelperProps) {
  const {
    courses,
    assignments,
    loading,
    error,
    userProfile,
    lastSyncedAt,
    isConnected,
    connectAndSync,
    refreshAssignments,
    disconnect,
  } = useGoogleClassroom();

  const [activeTab, setActiveTab] = useState<'courses' | 'pending' | 'upcoming' | 'completed'>('courses');

  // Auto-sync on mount if already connected
  useEffect(() => {
    if (isConnected && courses.length === 0 && !loading) {
      refreshAssignments();
    }
  }, [isConnected]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100">
              {helper.name || 'Google Classroom'}
            </h3>
            <p className="text-xs text-gray-500">
              {isConnected && userProfile
                ? `Connected as ${userProfile.name || userProfile.email}`
                : 'Not connected'}
            </p>
          </div>
          {isConnected && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshAssignments}
                disabled={loading}
                className="border-gray-700 text-gray-400"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={disconnect}
                className="border-gray-700 text-gray-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-6xl mx-auto">
          {!isConnected ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-100 mb-3">Connect Google Classroom</h2>
                <p className="text-gray-400">
                  Access your courses, assignments, and submissions from Google Classroom
                </p>
              </div>

              <Card className="bg-[#141414] border-gray-800 p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={connectAndSync}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <img
                        src="https://www.gstatic.com/images/branding/product/1x/classroom_48dp.png"
                        alt="Google Classroom"
                        className="h-5 w-5 mr-2"
                      />
                      Sign in with Google Classroom
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  You'll be asked to grant permission to view your Google Classroom courses and assignments
                </p>
              </Card>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {lastSyncedAt && (
                <p className="text-xs text-gray-500 mb-4">
                  Last synced: {new Date(lastSyncedAt).toLocaleString()}
                </p>
              )}

              <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                <TabsList className="bg-[#141414] border border-gray-800">
                  <TabsTrigger value="courses" className="data-[state=active]:bg-gray-800">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Courses ({courses.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-gray-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Overdue ({assignments.pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-gray-800">
                    <Clock className="h-4 w-4 mr-2" />
                    Upcoming ({assignments.upcoming.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-gray-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed ({assignments.completed.length})
                  </TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="mt-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                  ) : courses.length === 0 ? (
                    <Card className="bg-[#141414] border-gray-800 p-8 text-center">
                      <p className="text-gray-400">No courses found in your Google Classroom</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <Card key={course.id} className="bg-[#141414] border-gray-800 hover:border-gray-700 transition-all">
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: course.descriptionHeading || '#4CAF50' }}
                              >
                                {course.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-gray-100 mb-1">{course.name}</CardTitle>
                                {course.section && (
                                  <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                                    {course.section}
                                  </Badge>
                                )}
                                {course.descriptionHeading && (
                                  <CardDescription className="mt-2 text-gray-500 text-sm">
                                    {course.descriptionHeading}
                                  </CardDescription>
                                )}
                                {course.room && (
                                  <p className="text-xs text-gray-600 mt-1">Room: {course.room}</p>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pending/Overdue Tab */}
                <TabsContent value="pending" className="mt-6 space-y-3">
                  {assignments.pending.length === 0 ? (
                    <Card className="bg-[#141414] border-gray-800 p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-400">No overdue assignments!</p>
                    </Card>
                  ) : (
                    assignments.pending.map((assignment) => (
                      <Card key={assignment.id} className="bg-[#141414] border-red-800 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-100 mb-1">{assignment.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{assignment.courseName}</p>
                            {assignment.description && (
                              <p className="text-sm text-gray-400 mb-2">{assignment.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              {assignment.dueDate && (
                                <Badge variant="outline" className="border-red-700 text-red-400">
                                  Overdue: {formatDate(assignment.dueDate)}
                                </Badge>
                              )}
                              {assignment.points && (
                                <span className="text-gray-500">{assignment.points} points</span>
                              )}
                            </div>
                            {assignment.alternateLink && (
                              <Button
                                size="sm"
                                variant="link"
                                className="mt-2 p-0 h-auto text-blue-400"
                                onClick={() => window.open(assignment.alternateLink, '_blank')}
                              >
                                Open in Classroom →
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Upcoming Tab */}
                <TabsContent value="upcoming" className="mt-6 space-y-3">
                  {assignments.upcoming.length === 0 ? (
                    <Card className="bg-[#141414] border-gray-800 p-8 text-center">
                      <p className="text-gray-400">No upcoming assignments</p>
                    </Card>
                  ) : (
                    assignments.upcoming.map((assignment) => (
                      <Card key={assignment.id} className="bg-[#141414] border-gray-800 p-4 hover:border-gray-700 transition-all">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-100 mb-1">{assignment.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{assignment.courseName}</p>
                            {assignment.description && (
                              <p className="text-sm text-gray-400 mb-2">{assignment.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              {assignment.dueDate && (
                                <Badge variant="outline" className="border-gray-700 text-gray-400">
                                  Due: {formatDate(assignment.dueDate)} at {formatTime(assignment.dueDate)}
                                </Badge>
                              )}
                              {assignment.points && (
                                <span className="text-gray-500">{assignment.points} points</span>
                              )}
                            </div>
                            {assignment.alternateLink && (
                              <Button
                                size="sm"
                                variant="link"
                                className="mt-2 p-0 h-auto text-blue-400"
                                onClick={() => window.open(assignment.alternateLink, '_blank')}
                              >
                                Open in Classroom →
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Completed Tab */}
                <TabsContent value="completed" className="mt-6 space-y-3">
                  {assignments.completed.length === 0 ? (
                    <Card className="bg-[#141414] border-gray-800 p-8 text-center">
                      <p className="text-gray-400">No completed assignments yet</p>
                    </Card>
                  ) : (
                    assignments.completed.map((assignment) => (
                      <Card key={assignment.id} className="bg-[#141414] border-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-500 line-through mb-1">{assignment.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">{assignment.courseName}</p>
                            <div className="flex items-center gap-3 text-xs">
                              <Badge variant="outline" className="border-green-700 text-green-500">
                                Completed
                              </Badge>
                              {assignment.dueDate && (
                                <span className="text-gray-600">
                                  Was due: {formatDate(assignment.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
