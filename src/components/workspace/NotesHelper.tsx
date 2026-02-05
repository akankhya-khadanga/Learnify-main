/**
 * Notes Helper - File Management
 * 
 * Upload, organize, and search notes with AI indexing.
 */

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import { FileText, Upload, Search, Trash2, Download, Eye, File } from 'lucide-react';
import type { Helper, Space, Note } from '@/types/unifiedOS';

interface NotesHelperProps {
  helper: Helper;
  space: Space;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: '📄',
  text: '📝',
  markdown: '📋',
  image: '🖼️',
  link: '🔗',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-500/20 text-red-400',
  text: 'bg-blue-500/20 text-blue-400',
  markdown: 'bg-purple-500/20 text-purple-400',
  image: 'bg-green-500/20 text-green-400',
  link: 'bg-yellow-500/20 text-yellow-400',
};

export default function NotesHelper({ helper, space }: NotesHelperProps) {
  const notes = useUnifiedOSStore((state) => state.notes);
  const addNote = useUnifiedOSStore((state) => state.addNote);
  const removeNote = useUnifiedOSStore((state) => state.removeNote);
  const [searchQuery, setSearchQuery] = useState('');
  const spaceNotes = useMemo(() => notes[space.id] || [], [notes, space.id]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return spaceNotes;
    return spaceNotes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [spaceNotes, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock file upload - in production, upload to Supabase Storage
    const newNote: Note = {
      id: `note-${Date.now()}`,
      space_id: space.id,
      helper_id: helper.id,
      type: file.type.includes('pdf') ? 'pdf' : 'text',
      title: file.name,
      content: `Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      file_url: URL.createObjectURL(file),
      tags: [space.subject],
      is_indexed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addNote(space.id, newNote);
  };

  const handleQuickNote = () => {
    const title = prompt('Note title:');
    if (!title) return;

    const content = prompt('Note content:');
    if (!content) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      space_id: space.id,
      helper_id: helper.id,
      type: 'markdown',
      title,
      content,
      tags: [space.subject],
      is_indexed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addNote(space.id, newNote);
  };

  const handleDelete = (noteId: string) => {
    if (confirm('Delete this note?')) {
      removeNote(space.id, noteId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0f0f0f] p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100">
              {helper.name || 'Notes'}
            </h3>
            <p className="text-xs text-gray-500">File Management</p>
          </div>
          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
            {spaceNotes.length} notes
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md,.png,.jpg"
          />
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickNote}
            className="flex-1 border-gray-700 text-gray-400"
          >
            <FileText className="h-4 w-4 mr-2" />
            Quick Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1a1a] border-gray-800 focus:border-gray-700 text-gray-100"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">
              {spaceNotes.length === 0 ? 'No notes yet' : 'No results found'}
            </h4>
            <p className="text-sm text-gray-500">
              {spaceNotes.length === 0
                ? 'Upload files or create quick notes to get started'
                : 'Try adjusting your search query'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="bg-[#141414] border-gray-800 hover:border-gray-700 transition-all overflow-hidden group"
              >
                {/* Icon Header */}
                <div className={`p-6 ${FILE_TYPE_COLORS[note.type]} flex items-center justify-center text-5xl`}>
                  {FILE_TYPE_ICONS[note.type]}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-100 mb-2 line-clamp-2">
                    {note.title}
                  </h4>

                  {note.content && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {note.content}
                    </p>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs border-gray-700 text-gray-500"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-gray-400 hover:text-gray-100"
                      onClick={() => note.file_url && window.open(note.file_url, '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-800">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
