import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateSummary, generateFlashcards, generateQuiz } from '@/lib/gemini';
import { extractTextFromFile, createNote, getUserNotes } from '@/services/notesService';
import { getCurrentUserId } from '@/lib/auth';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslatedText } from '@/hooks/useTranslation';
import { MOCK_NOTES, MOCK_FOLDERS, USE_MOCK_DATA, mockDelay } from '@/mocks';
import { Upload, FileText, Sparkles, Download, Loader2, Folder, Search, Tag, Paperclip, Edit, Trash, Plus, X, FileUp } from 'lucide-react';
import GridDistortion from '@/components/3D/GridDistortion';
import { SimplePDFViewer } from '@/components/pdf/SimplePDFViewer';
import { pdfService } from '@/services/pdfService';

interface Flashcard {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function Notes() {
  // Notes library state
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // PDF state
  const [pdfDocuments, setPdfDocuments] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<any | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const { toast } = useToast();

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const { notes: userNotes, error } = await getUserNotes(userId);
        if (error) {
          console.error('Error loading notes:', error);
          toast({
            title: 'Error loading notes',
            description: error,
            variant: 'destructive',
          });
          // Set to empty arrays on error
          setNotes([]);
          setFolders([]);
        } else {
          setNotes(userNotes || []);
          // TODO: Load real folders from database when folder feature is implemented
          setFolders([]);
        }
      } else {
        // No user logged in, show empty state
        setNotes([]);
        setFolders([]);
      }
    } catch (error: any) {
      console.error('Error loading notes:', error);
      setNotes([]);
      setFolders([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      // Extract text from file
      const extractedText = await extractTextFromFile(uploadedFile);
      setContent(extractedText);

      // Auto-generate summary
      setIsGeneratingSummary(true);
      const summaryResult = await generateSummary(extractedText);
      setSummary(summaryResult);
      setIsGeneratingSummary(false);

      // Auto-generate flashcards after summary
      setIsGeneratingFlashcards(true);
      const generatedFlashcards = await generateFlashcards(extractedText);
      setFlashcards(generatedFlashcards);
      setIsGeneratingFlashcards(false);

      // Save note to database if user is logged in
      const userId = await getCurrentUserId();
      if (userId) {
        await createNote(userId, uploadedFile.name, extractedText);
        // Refresh notes list
        await loadNotes();
      }

      toast({
        title: 'File processed',
        description: `Summary and ${generatedFlashcards.length} flashcards generated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error processing file',
        description: error.message || 'Failed to process file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setIsGeneratingSummary(false);
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!content) {
      toast({
        title: 'No content',
        description: 'Please upload a file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingFlashcards(true);
    try {
      const generatedFlashcards = await generateFlashcards(content);
      setFlashcards(generatedFlashcards);
      toast({
        title: 'Flashcards generated',
        description: `Generated ${generatedFlashcards.length} flashcards.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate flashcards.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!content) {
      toast({
        title: 'No content',
        description: 'Please upload a file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const generatedQuiz = await generateQuiz(content);
      setQuiz(generatedQuiz);
      toast({
        title: 'Quiz generated',
        description: `Generated ${generatedQuiz.length} quiz questions.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [attemptedQuestions, setAttemptedQuestions] = useState<number[]>([]);
  const [quizReport, setQuizReport] = useState(null);

  const handleAnswerSelection = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (!attemptedQuestions.includes(currentQuestionIndex)) {
      setAttemptedQuestions((prev) => [...prev, currentQuestionIndex]);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, quiz.length - 1));
  };

  const handlePreviousQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = attemptedQuestions.filter(
      (index) => quiz[index].correctAnswer === selectedAnswer
    ).length;
    const totalQuestions = quiz.length;
    const wrongAnswers = totalQuestions - correctAnswers;

    setQuizReport({
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      attemptedQuestions: attemptedQuestions.length,
    });
  };

  const handleRetakeQuiz = () => {
    setQuizReport(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAttemptedQuestions([]);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both title and content for your note.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        toast({
          title: 'Not logged in',
          description: 'Please log in to create notes.',
          variant: 'destructive',
        });
        return;
      }

      const { note, error } = await createNote(userId, newNoteTitle, newNoteContent);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Note created',
        description: `"${newNoteTitle}" has been saved successfully.`,
      });

      // Reset form and close dialog
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNoteDialog(false);

      // Refresh notes list
      await loadNotes();
    } catch (error: any) {
      toast({
        title: 'Error creating note',
        description: error.message || 'Failed to create note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderQuestionNavigation = () => (
    <div className="flex space-x-2">
      {(quiz || []).map((_, index) => (
        <span
          key={index}
          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${index === currentQuestionIndex
            ? 'bg-primary text-white'
            : attemptedQuestions.includes(index)
              ? 'bg-success/20 text-success'
              : 'bg-muted text-muted-foreground'
            }`}
          onClick={() => setCurrentQuestionIndex(index)}
        >
          {index + 1}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Compact Title Bar */}
      <div className="sticky top-0 z-50 border-b border-purple/30 bg-slate-50 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-black uppercase text-accent">
              <TranslatedText text="Smart Notes" />
            </h1>
          </div>
          <p className="text-sm font-bold text-white/70 uppercase hidden md:block">
            <TranslatedText text="AI-Powered Study Materials" />
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 border border-slate-200 dark:border-slate-700 shadow-accent bg-white dark:bg-slate-800">
            <TabsTrigger
              value="library"
              className="data-[state=active]:bg-blue data-[state=active]:text-white font-black uppercase"
            >
              <TranslatedText text="Library" />
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-accent data-[state=active]:text-white font-black uppercase"
            >
              <TranslatedText text="Upload" />
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase"
            >
              <TranslatedText text="Summary" />
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-accent data-[state=active]:text-white font-black uppercase"
            >
              <TranslatedText text="Flashcards" />
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase"
            >
              <TranslatedText text="Quiz" />
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="data-[state=active]:bg-blue data-[state=active]:text-white font-black uppercase"
            >
              <TranslatedText text="PDF Viewer" />
            </TabsTrigger>
          </TabsList>

          {/* Library Tab - NEW */}
          <TabsContent value="library">
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              {/* Sidebar */}
              <div className="space-y-4">
                {/* Search */}
                <Card className="border border-slate-200 dark:border-slate-700 shadow-float bg-white dark:bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Folders */}
                <Card className="border border-slate-200 dark:border-slate-700 shadow-float bg-white dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-black uppercase text-[#6DAEDB]">
                      <TranslatedText text="Folders" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={selectedFolder === null ? "default" : "ghost"}
                        className="w-full justify-start font-bold"
                        onClick={() => setSelectedFolder(null)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        <TranslatedText text="All Notes" />
                        <Badge className="ml-auto" variant="secondary">{notes?.length || 0}</Badge>
                      </Button>
                      {(folders || []).map((folder: any) => (
                        <Button
                          key={folder.id}
                          variant={selectedFolder === folder.id ? "default" : "ghost"}
                          className="w-full justify-start font-bold"
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <Folder className="mr-2 h-4 w-4" style={{ color: folder.color }} />
                          {folder.name}
                          <Badge className="ml-auto" variant="secondary">{folder.noteCount}</Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase text-white">
                    {selectedFolder
                      ? folders.find((f: any) => f.id === selectedFolder)?.name
                      : <TranslatedText text="All Notes" />}
                  </h2>
                  <Button
                    className="bg-accent border border-slate-200 dark:border-slate-700 shadow-accent font-black uppercase"
                    onClick={() => setShowNewNoteDialog(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <TranslatedText text="New Note" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {(notes || [])
                    .filter((note: any) =>
                      (!selectedFolder || note.folderId === selectedFolder) &&
                      (!searchQuery || note.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((note: any, index: number) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className="border border-slate-200 dark:border-slate-700 shadow-accent bg-white dark:bg-slate-800 cursor-pointer hover:shadow-primary transition-all"
                          onClick={() => setSelectedNote(note)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-black uppercase text-white truncate">
                                  {note.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground mt-1">
                                  {new Date(note.updatedAt).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-white/80 line-clamp-3 mb-3">
                              {note.content}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(note.tags || []).map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="font-bold cursor-pointer hover:bg-accent hover:text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTag(tag);
                                  }}
                                >
                                  <Tag className="mr-1 h-3 w-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                {note.attachments.length} attachment(s)
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {(notes || []).length === 0 && !isLoadingNotes && (
                  <Card className="border border-slate-200 dark:border-slate-700 shadow-float bg-white dark:bg-slate-800/50">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-16 w-16 text-[#6DAEDB] mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-black uppercase text-white mb-2">
                        <TranslatedText text="No Notes Yet" />
                      </h3>
                      <p className="text-white/70 font-bold mb-6">
                        <TranslatedText text="Create your first note or upload a document to get started" />
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => setShowNewNoteDialog(true)}
                          className="bg-pink hover:bg-pink/90 text-white border-2 border-black shadow-pink-heavy font-black uppercase"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          <TranslatedText text="Create Note" />
                        </Button>
                        <Button
                          onClick={() => {
                            // Switch to upload tab
                            const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
                            uploadTab?.click();
                          }}
                          variant="outline"
                          className="border-2 border-black font-black uppercase"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          <TranslatedText text="Upload File" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {isLoadingNotes && (
                  <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800/50">
                    <CardContent className="p-12 text-center">
                      <Loader2 className="h-12 w-12 text-blue mx-auto mb-4 animate-spin" />
                      <p className="text-white/70 font-bold">
                        <TranslatedText text="Loading your notes..." />
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase text-primary">
                  <TranslatedText text="Upload Your Notes" />
                </CardTitle>
                <CardDescription className="text-white font-bold">
                  <TranslatedText text="Upload PDFs, images, or documents. We'll extract and process the content." />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple p-12 text-center bg-black/30">
                  <Upload className="mb-4 h-16 w-16 text-primary" />
                  <h3 className="mb-2 text-xl font-black uppercase text-white">
                    <TranslatedText text="Upload your file" />
                  </h3>
                  <p className="mb-4 text-sm text-white font-bold">
                    <TranslatedText text="PDF, DOC, DOCX, JPG, PNG up to 20MB" />
                  </p>
                  <label htmlFor="file-upload">
                    <Button
                      asChild
                      className="bg-pink text-white border-2 border-black shadow-pink-heavy font-black uppercase hover:bg-pink/80"
                    >
                      <span><TranslatedText text="Choose File" /></span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {file && (
                    <div className="mt-4">
                      <p className="text-sm text-primary font-black">
                        ✓ {file.name} uploaded successfully
                      </p>
                      {isProcessing && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-white font-bold">
                          <Loader2 className="h-4 w-4 animate-spin text-pink" />
                          <TranslatedText text="Processing file..." />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle><TranslatedText text="AI-Generated Summary" /></CardTitle>
                    <CardDescription><TranslatedText text="Key points and main concepts from your notes" /></CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateQuiz}
                      disabled={!summary || isGeneratingQuiz}
                      className="bg-primary/20 text-primary hover:bg-primary hover:text-black border-neon/50"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <TranslatedText text="Generating..." />
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          <TranslatedText text="Generate Quiz" />
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      <TranslatedText text="Export" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isGeneratingSummary ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground"><TranslatedText text="Generating summary with AI..." /></p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{summary}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      <TranslatedText text="Upload a file to generate a summary" />
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle><TranslatedText text="AI-Generated Flashcards" /></CardTitle>
                    <CardDescription><TranslatedText text="Review key concepts with interactive flashcards" /></CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateQuiz}
                    disabled={flashcards.length === 0 || isGeneratingQuiz}
                    className="bg-primary/20 text-primary hover:bg-primary hover:text-black border-neon/50"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <TranslatedText text="Generating..." />
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <TranslatedText text="Generate Quiz" />
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(flashcards || []).length > 0 ? (
                  <div className="space-y-4">
                    {(flashcards || []).map((flashcard, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="mb-2 font-semibold">Q: <TranslatedText text={flashcard.question} /></div>
                          <div className="text-sm text-muted-foreground">
                            A: <TranslatedText text={flashcard.answer} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      <TranslatedText text={content ? "Click the button to generate flashcards from your notes" : "Upload a file first to generate flashcards"} />
                    </p>
                    <Button
                      className="mt-4"
                      disabled={!content || isGeneratingFlashcards}
                      onClick={handleGenerateFlashcards}
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <TranslatedText text="Generating..." />
                        </>
                      ) : (
                        <TranslatedText text="Generate Flashcards" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            {quiz.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle><TranslatedText text="AI-Generated Quiz" /></CardTitle>
                  <CardDescription><TranslatedText text="Test your knowledge with adaptive quizzes" /></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      <TranslatedText text={content ? "Click the button to generate a quiz from your notes" : "Upload a file first to generate a quiz"} />
                    </p>
                    <Button
                      className="mt-4"
                      disabled={!content || isGeneratingQuiz}
                      onClick={handleGenerateQuiz}
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <TranslatedText text="Generating..." />
                        </>
                      ) : (
                        <TranslatedText text="Generate Quiz" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {(quiz || []).length > 0 && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-lg font-semibold">Total Questions: {(quiz || []).length}</p>
                  {renderQuestionNavigation()}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="mb-6 text-lg font-semibold">{quiz?.[currentQuestionIndex]?.question}</p>
                    <ul className="space-y-4">
                      {(quiz?.[currentQuestionIndex]?.options || []).map((option, index) => (
                        <li key={index}>
                          <Button
                            className="w-full text-left py-3 px-4"
                            variant={selectedAnswer === index ? 'secondary' : 'default'}
                            onClick={() => handleAnswerSelection(index)}
                            disabled={showExplanation}
                          >
                            {option}
                          </Button>
                        </li>
                      ))}
                    </ul>
                    {showExplanation && (
                      <div className="mt-6">
                        {selectedAnswer === quiz?.[currentQuestionIndex]?.correctAnswer ? (
                          <p className="text-green-500 text-lg">Correct!</p>
                        ) : (
                          <p className="text-red-500 text-lg">
                            Incorrect. Correct answer: {quiz?.[currentQuestionIndex]?.options?.[quiz?.[currentQuestionIndex]?.correctAnswer]}
                          </p>
                        )}
                        <p className="mt-4 text-base">{quiz?.[currentQuestionIndex]?.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="flex justify-between mt-8">
                  <Button className="px-6 py-3" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>
                  {currentQuestionIndex === quiz.length - 1 ? (
                    <Button className="px-6 py-3" onClick={handleSubmitQuiz}>
                      Submit
                    </Button>
                  ) : (
                    <Button className="px-6 py-3" onClick={handleNextQuestion}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
            {quizReport && (
              <div className="mt-12">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Report</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold">Total Questions: {quizReport.totalQuestions}</p>
                    <p className="text-lg text-green-500">Correct Answers: {quizReport.correctAnswers}</p>
                    <p className="text-lg text-red-500">Wrong Answers: {quizReport.wrongAnswers}</p>
                    <p className="text-lg">Attempted Questions: {quizReport.attemptedQuestions}</p>
                    <Button className="mt-6 px-6 py-3" onClick={handleRetakeQuiz}>
                      Retake Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* PDF Viewer Tab */}
          <TabsContent value="pdf">
            {!selectedPdf ? (
              <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-2xl font-black uppercase text-blue">
                    <TranslatedText text="PDF Annotator" />
                  </CardTitle>
                  <CardDescription className="text-white font-bold">
                    <TranslatedText text="Upload and annotate PDF documents with drawing, highlighting, and notes" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue p-12 text-center bg-black/30">
                    <FileUp className="mb-4 h-16 w-16 text-blue" />
                    <h3 className="mb-2 text-xl font-black uppercase text-white">
                      <TranslatedText text="Upload PDF Document" />
                    </h3>
                    <p className="mb-4 text-sm text-white font-bold">
                      <TranslatedText text="Upload a PDF file to view and annotate" />
                    </p>
                    <label htmlFor="pdf-upload">
                      <Button
                        asChild
                        className="bg-blue text-white border-2 border-black shadow-blue-heavy font-black uppercase hover:bg-blue/80"
                        disabled={isUploadingPdf}
                      >
                        <span>
                          {isUploadingPdf ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <TranslatedText text="Uploading..." />
                            </>
                          ) : (
                            <TranslatedText text="Choose PDF File" />
                          )}
                        </span>
                      </Button>
                      <input
                        id="pdf-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setIsUploadingPdf(true);
                          try {
                            const userId = await getCurrentUserId();
                            if (!userId) {
                              toast({
                                title: 'Not logged in',
                                description: 'Please log in to upload PDFs',
                                variant: 'destructive',
                              });
                              return;
                            }

                            // Upload PDF file to storage
                            const { url, path } = await pdfService.uploadPDF(file, userId);

                            // Create PDF document record in database
                            const document = await pdfService.createPDFDocument(
                              userId,
                              file.name,
                              url,
                              file.size
                            );

                            setSelectedPdf(document);
                            toast({
                              title: 'PDF uploaded',
                              description: `${file.name} uploaded successfully`,
                            });
                          } catch (error: any) {
                            toast({
                              title: 'Upload failed',
                              description: error.message || 'Failed to upload PDF',
                              variant: 'destructive',
                            });
                          } finally {
                            setIsUploadingPdf(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase text-white">{selectedPdf.title}</h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPdf(null)}
                    className="font-black uppercase"
                  >
                    <X className="mr-2 h-4 w-4" />
                    <TranslatedText text="Close" />
                  </Button>
                </div>
                <SimplePDFViewer
                  fileUrl={selectedPdf.file_url}
                  onClose={() => setSelectedPdf(null)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* New Note Dialog */}
        {showNewNoteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl mx-4"
            >
              <Card className="border-4 border-black shadow-pink-brutal bg-obsidian">
                <CardHeader className="border-b-4 border-pink">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-black uppercase text-pink">
                      <TranslatedText text="Create New Note" />
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewNoteDialog(false)}
                      className="text-white hover:text-pink"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-white mb-2 block uppercase">
                      <TranslatedText text="Title" />
                    </label>
                    <Input
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Enter note title..."
                      className="border-2 border-black bg-darknavy text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white mb-2 block uppercase">
                      <TranslatedText text="Content" />
                    </label>
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Enter your notes here..."
                      rows={10}
                      className="w-full rounded-md border-2 border-black bg-darknavy text-white p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateNote}
                      className="flex-1 bg-pink hover:bg-pink/90 text-white border-2 border-black shadow-pink-heavy font-black uppercase"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <TranslatedText text="Create Note" />
                    </Button>
                    <Button
                      onClick={() => setShowNewNoteDialog(false)}
                      variant="outline"
                      className="border-2 border-black font-black uppercase"
                    >
                      <TranslatedText text="Cancel" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Note Viewer Modal */}
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
            >
              <Card className="border border-slate-200 dark:border-slate-700 rounded-2xl shadow-float bg-white dark:bg-slate-800">
                <CardHeader className="border-b border-neon/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-black uppercase text-primary mb-2">
                        {selectedNote.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-white/60 font-bold">
                        <span>
                          Created: {new Date(selectedNote.created_at || selectedNote.createdAt).toLocaleDateString()}
                        </span>
                        {selectedNote.updated_at && (
                          <span>
                            Updated: {new Date(selectedNote.updated_at || selectedNote.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNote(null)}
                      className="text-white hover:text-primary"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                  {/* Tags */}
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedNote.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="font-bold border-neon/30 text-primary"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-white/90 leading-relaxed">
                        {selectedNote.content}
                      </pre>
                    </div>
                  </div>


                  {/* Summary if available */}
                  {selectedNote.summary && (
                    <div className="mt-6">
                      <h3 className="text-lg font-black uppercase text-pink mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        <TranslatedText text="AI Summary" />
                      </h3>
                      <div className="bg-gradient-to-br from-pink/10 to-accent-500/10 border-2 border-pink/30 rounded-lg p-6 space-y-4">
                        {selectedNote.summary
                          .split('\n')
                          .filter((line: string) => line.trim() && !line.match(/^---+$/))
                          .map((line: string, index: number) => {
                            // Clean all markdown symbols
                            let cleanLine = line
                              .replace(/^#{1,6}\s*/, '')
                              .replace(/\*\*/g, '')
                              .replace(/^[\*\-]\s*/, '')
                              .replace(/^\d+\.\s*/, '')
                              .trim();

                            if (!cleanLine) return null;

                            // Check if it was a header
                            const wasHeader = line.startsWith('#');
                            // Check if it was a list item
                            const wasList = line.trim().match(/^[\*\-]\s/) || line.trim().match(/^\d+\.\s/);

                            if (wasHeader) {
                              return (
                                <div key={index} className="pt-2">
                                  <h4 className="text-base font-black text-primary uppercase">
                                    {cleanLine}
                                  </h4>
                                </div>
                              );
                            }

                            if (wasList) {
                              return (
                                <div key={index} className="flex gap-3 items-start pl-2">
                                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></div>
                                  <p className="text-white/90 leading-relaxed">
                                    {cleanLine}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <p key={index} className="text-white/90 leading-relaxed">
                                {cleanLine}
                              </p>
                            );
                          })}
                      </div>
                    </div>
                  )}


                  {/* File URL if available */}
                  {selectedNote.file_url && (
                    <div className="mt-4">
                      <Button
                        onClick={() => window.open(selectedNote.file_url, '_blank')}
                        variant="outline"
                        className="border-2 border-blue text-blue hover:bg-blue hover:text-white font-black"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <TranslatedText text="Download Original File" />
                      </Button>
                    </div>
                  )}
                </CardContent>
                <div className="border-t border-neon/30 p-6 flex gap-3">
                  <Button
                    onClick={() => setSelectedNote(null)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-black uppercase rounded-xl"
                  >
                    <TranslatedText text="Close" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-black font-black uppercase"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast({
                        title: 'Edit feature',
                        description: 'Edit functionality coming soon!',
                      });
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <TranslatedText text="Edit" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      toast({
                        title: 'Delete feature',
                        description: 'Delete functionality coming soon!',
                      });
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <TranslatedText text="Delete" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div >
  );
}
