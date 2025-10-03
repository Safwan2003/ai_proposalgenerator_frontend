'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProposalStore } from '@/store/proposalStore';
import { deleteSection as deleteSectionApi, removeImage } from '@/lib/api';
import { useEffect } from 'react';
import SectionImages from './SectionImages';

export default function SectionCard({ section, proposalId, openAiDialog, openImagePicker, openVersionHistoryModal }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const { updateSectionContent, deleteSection, removeImageFromSection, addImageToSection } = useProposalStore();

  const editor = useEditor({
    extensions: [StarterKit],
    content: section.contentHtml,
    immediatelyRender: false,
    editable: false, // Initially not editable
    onBlur: ({ editor }) => {
      updateSectionContent(section.id, editor.getHTML());
    },
  });

  const toggleEdit = () => {
    editor?.setEditable(!editor.isEditable);
  };

  // Update editor content when section.contentHtml changes
  useEffect(() => {
    if (editor && section.contentHtml !== editor.getHTML()) {
      editor.commands.setContent(section.contentHtml, false);
    }
  }, [section.contentHtml, editor]);

  const handleDeleteImage = async (sectionId: number, imageUrl: string) => {
    // Optimistically remove the image from the UI
    removeImageFromSection(sectionId, imageUrl);

    try {
      if (proposalId) {
        await removeImage(proposalId, sectionId, imageUrl);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Revert the UI change if the API call fails
      addImageToSection(sectionId, imageUrl);
      alert('Error deleting image. Please try again.');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!proposalId) return;

    try {
      await deleteSectionApi(proposalId, sectionId);
      deleteSection(sectionId);
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:border-indigo-300 transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
        <button {...listeners} {...attributes} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 cursor-grab">
          Drag
        </button>
      </div>
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        <EditorContent editor={editor} />
      </div>
      <SectionImages section={section} handleDeleteImage={handleDeleteImage} />
      <div className="mt-5 flex flex-wrap justify-end gap-3">

        <button onClick={() => openImagePicker(section.id)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300">
          Add Image
        </button>
        <button onClick={toggleEdit} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
          {editor?.isEditable ? 'Save' : 'Edit'}
        </button>
        <button onClick={() => openAiDialog(section.id)} className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors shadow-sm">
          AI Enhance
        </button>
        <button onClick={() => openVersionHistoryModal(section.id)} className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors shadow-sm">
          History
        </button>
        <button onClick={() => handleDeleteSection(section.id)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm">
          Delete
        </button>
      </div>
    </div>
  );
}