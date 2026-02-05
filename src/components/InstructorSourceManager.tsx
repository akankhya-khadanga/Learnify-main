import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { VerifiedSource } from '@/mocks/verifiedSources';
import { Upload, FileText, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstructorSourceManagerProps {
  sources: VerifiedSource[];
  isOpen: boolean;
  onClose: () => void;
  onSourcesUpdate?: (sources: VerifiedSource[]) => void;
}

export const InstructorSourceManager: React.FC<InstructorSourceManagerProps> = ({
  sources,
  isOpen,
  onClose,
  onSourcesUpdate,
}) => {
  const [localSources, setLocalSources] = useState<VerifiedSource[]>(sources);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newSource, setNewSource] = useState({
    title: '',
    type: 'course_material' as VerifiedSource['type'],
  });

  const handleToggleSource = (sourceId: string) => {
    const updated = localSources.map(s =>
      s.id === sourceId ? { ...s, active: !s.active } : s
    );
    setLocalSources(updated);
    onSourcesUpdate?.(updated);

    const source = updated.find(s => s.id === sourceId);
    toast({
      title: source?.active ? 'Source Activated' : 'Source Deactivated',
      description: `${source?.title} is now ${source?.active ? 'active' : 'inactive'}`,
    });
  };

  const handleDeleteSource = (sourceId: string) => {
    const source = localSources.find(s => s.id === sourceId);
    if (!confirm(`Are you sure you want to delete "${source?.title}"?`)) return;

    const updated = localSources.filter(s => s.id !== sourceId);
    setLocalSources(updated);
    onSourcesUpdate?.(updated);

    toast({
      title: 'Source Deleted',
      description: `Removed ${source?.title}`,
    });
  };

  const handleUploadSource = () => {
    if (!newSource.title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a title for the source',
        variant: 'destructive',
      });
      return;
    }

    const created: VerifiedSource = {
      id: `src-${Date.now()}`,
      title: newSource.title,
      type: newSource.type,
      uploadedBy: 'Current Instructor',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: true,
      active: true,
      pageCount: Math.floor(Math.random() * 100) + 10, // Mock page count
    };

    const updated = [...localSources, created];
    setLocalSources(updated);
    onSourcesUpdate?.(updated);

    toast({
      title: 'Source Added',
      description: `${created.title} has been uploaded successfully`,
    });

    setNewSource({ title: '', type: 'course_material' });
    setShowUploadForm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-4 border-black pb-4">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#C9B458]" />
            Manage Verified Sources
          </DialogTitle>
          <DialogDescription className="text-base font-bold">
            Upload and manage course materials for AI verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Form */}
          {showUploadForm ? (
            <Card className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 bg-[#C9B458]/10">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload New Source
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="font-bold">Source Title *</Label>
                  <Input
                    id="title"
                    value={newSource.title}
                    onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                    placeholder="e.g., React Hooks Documentation"
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="font-bold">Source Type</Label>
                  <Select
                    value={newSource.type}
                    onValueChange={(value) => setNewSource({ ...newSource, type: value as VerifiedSource['type'] })}
                  >
                    <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black">
                      <SelectItem value="course_material">Course Material</SelectItem>
                      <SelectItem value="lecture_notes">Lecture Notes</SelectItem>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="research_paper">Research Paper</SelectItem>
                      <SelectItem value="instructor_upload">Instructor Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleUploadSource}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Source
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              onClick={() => setShowUploadForm(true)}
              className="w-full bg-[#C9B458] hover:bg-[#B8A347] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Source
            </Button>
          )}

          {/* Source List */}
          <ScrollArea className="h-[400px] border-4 border-black rounded-lg">
            <div className="p-4 space-y-3">
              {localSources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-black/20" />
                  <p className="text-black/60 font-bold">No sources uploaded yet</p>
                  <p className="text-sm text-black/40">Add your first source to get started</p>
                </div>
              ) : (
                localSources.map((source) => (
                  <Card
                    key={source.id}
                    className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded border-2 border-black flex items-center justify-center ${source.active ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                          <FileText className={`w-5 h-5 ${source.active ? 'text-white' : 'text-black/40'}`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base mb-2 text-white">{source.title}</h4>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="border-black">
                            {source.type.replace('_', ' ')}
                          </Badge>
                          {source.verified && (
                            <Badge className="bg-green-500 text-white border border-black">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {source.active ? (
                            <Badge className="bg-blue-500 text-white border border-black">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-black text-black/60">
                              Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-black/60 space-y-1">
                          <p>Uploaded by: {source.uploadedBy}</p>
                          <p>Date: {source.uploadDate}</p>
                          {source.pageCount && <p>Pages: {source.pageCount}</p>}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={source.active}
                            onCheckedChange={() => handleToggleSource(source.id)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {source.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSource(source.id)}
                          className="border-2 border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Stats */}
          <div className="flex gap-4 text-center border-t-4 border-black pt-4">
            <div className="flex-1">
              <p className="text-2xl font-black text-green-600">{localSources.filter(s => s.active).length}</p>
              <p className="text-xs text-black/60 font-bold">Active Sources</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-black">{localSources.length}</p>
              <p className="text-xs text-black/60 font-bold">Total Sources</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-black text-[#C9B458]">{localSources.filter(s => s.verified).length}</p>
              <p className="text-xs text-black/60 font-bold">Verified</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
