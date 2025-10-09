'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProposalStore } from '@/store/proposalStore';
import { deleteSection as deleteSectionApi, removeImage, updateSectionApi, updateChart, generateChartFromContent } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import SectionImages from './SectionImages';
import TableMenuBar from './TableMenuBar';
import { suggestChartType } from '@/lib/api';
import { debounce } from 'lodash';

import dynamic from 'next/dynamic';
const MermaidChart = dynamic(() => import('../MermaidChart'), { ssr: false });

const getChartType = (mermaidCode: string): string => {
  if (!mermaidCode) return '';
  const code = mermaidCode.toLowerCase().trim();
  if (code.startsWith('graph') || code.startsWith('flowchart')) return 'Flowchart';
  if (code.startsWith('gantt')) return 'Gantt Chart';
  if (code.startsWith('pie')) return 'Pie Chart';
  if (code.startsWith('sequence')) return 'Sequence Diagram';
  if (code.startsWith('mindmap')) return 'Mind Map';
  if (code.startsWith('journey')) return 'User Journey';
  if (code.startsWith('c4')) return 'C4 Diagram';
  return 'Diagram';
};

import { Section } from '@/types/proposal';

interface ClientSideSectionCardProps {
  section: Section;
  proposalId: number;
  openAiDialog: (sectionId: number) => void;
  openImagePicker: (sectionId: number) => void;
  openVersionHistoryModal: (sectionId: number) => void;
  openChartWizardForSection: (sectionId: number) => void;
}

export default function ClientSideSectionCard({ section, proposalId, openAiDialog, openImagePicker, openVersionHistoryModal, openChartWizardForSection }: ClientSideSectionCardProps) {
  console.log("SectionCard received section:", section);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const { updateSectionContent, deleteSection, removeImageFromSection, addImageToSection, updateSectionMermaidChart, updateSectionImagePlacement } = useProposalStore();

  const [editableMermaidContent, setEditableMermaidContent] = useState(section.mermaid_chart || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestedChart, setSuggestedChart] = useState<string | null>(null);

  const debouncedSuggestChart = useCallback(
    debounce(async (content) => {
      if (proposalId && section.id) {
        const suggestion = await suggestChartType(proposalId, section.id);
        if (suggestion && suggestion !== 'none') {
          setSuggestedChart(suggestion);
        } else {
          setSuggestedChart(null);
        }
      }
    }, 1000), // 1 second debounce
    [proposalId, section.id]
  );

  const editor = useEditor({
    extensions: [StarterKit, Table, TableRow, TableHeader, TableCell],
    content: section.contentHtml || '',
    editable: false,
    immediatelyRender: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (editor.isEditable) {
        debouncedSuggestChart(editor.getHTML());
      }
    },
    onBlur: async ({ editor }) => {
      if (editor.isEditable) {
        const newHtml = editor.getHTML();
        updateSectionContent(section.id, newHtml);
        updateSectionMermaidChart(section.id, editableMermaidContent);
        if (proposalId) {
          await updateSectionApi(proposalId, section.id, { contentHtml: newHtml, mermaid_chart: editableMermaidContent });
        }
      }
    },
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editor && !editor.isDestroyed && section.contentHtml !== editor.getHTML()) {
      editor.commands.setContent(section.contentHtml, false);
    }
    if (section.mermaid_chart !== editableMermaidContent) {
      setEditableMermaidContent(section.mermaid_chart || '');
    }
  }, [section.contentHtml, section.mermaid_chart, editor]);

  const toggleEdit = async () => {
    if (!editor) return;
    const isEditable = !editor.isEditable;
    editor.setEditable(isEditable);
    if (!isEditable) { // Just exited edit mode
      const newHtml = editor.getHTML();
      updateSectionContent(section.id, newHtml);
      updateSectionMermaidChart(section.id, editableMermaidContent);
      if (proposalId) {
        await updateSectionApi(proposalId, section.id, { contentHtml: newHtml, mermaid_chart: editableMermaidContent });
      }
    }
  };

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

  const handleSelectImage = async (imageUrl: string) => {
    if (selectedSectionId && proposalId) {
      // Optimistically update the UI
      addImageToSection(selectedSectionId, imageUrl);

      try {
        await addImage(proposalId, selectedSectionId, imageUrl);
      } catch (error) {
        console.error('Error adding image:', error);
        // Revert the UI change if the API call fails
        removeImageFromSection(selectedSectionId, imageUrl);
        alert('Error adding image. Please try again.');
      }
    }
  };

  const handleDeleteSection = async () => {
    if (!proposalId) return;
    deleteSection(section.id);
    await deleteSectionApi(proposalId, section.id);
  };

  const handleUpdateChart = async () => {
    if (!proposalId || !aiPrompt.trim()) return;
    const updatedSection = await updateChart(proposalId, section.id, aiPrompt, editableMermaidContent);
    updateSectionMermaidChart(section.id, updatedSection.mermaid_chart || '');
    setAiPrompt('');
  };

  const handleGenerateDiagram = async () => {
    if (!proposalId) return;
    openChartWizardForSection(section.id);
  };

  const handleRemoveDiagram = async () => {
    if (!proposalId) return;
    updateSectionMermaidChart(section.id, '');
    await updateSectionApi(proposalId, section.id, { mermaid_chart: '' });
  };

  const chartType = section.chartType || getChartType(section.mermaid_chart || '');

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
        <button {...listeners} {...attributes} className="px-3 py-1 text-sm bg-gray-100 rounded-md cursor-grab">Drag</button>
      </div>

      {mounted && editor?.isEditable && <TableMenuBar editor={editor} />}
      {mounted && <div className="prose max-w-none">
        <EditorContent editor={editor} />
      </div>}

      {mounted && editor?.isEditable && (
        <div className="mt-4">
          <label className="block text-sm font-medium">Mermaid Diagram Code</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 font-mono"
            rows={6}
            value={editableMermaidContent}
            onChange={(e) => setEditableMermaidContent(e.target.value)}
          />
          <div className="mt-2">
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 font-mono"
              placeholder="Describe your change... (e.g., 'Change B to a decision node')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button onClick={handleUpdateChart} disabled={!aiPrompt.trim()} className="mt-2 px-4 py-2 text-sm bg-teal-500 text-white rounded-md">Update with AI</button>
          </div>
        </div>
      )}

      {(section.mermaid_chart) && (
        <div className="mt-4 p-4 border rounded-lg relative">
          <span className="absolute top-2 right-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">{chartType}</span>
          <MermaidChart chart={section.mermaid_chart} />
        </div>
      )}

      <SectionImages section={section} handleDeleteImage={handleDeleteImage} />

      <div className="mt-4">
        <label className="block text-sm font-medium">Image Placement</label>
        <select
          value={section.image_placement || 'inline-left'}
          onChange={(e) => updateSectionImagePlacement(section.id, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        >
          <option value="inline-left">Inline Left</option>
          <option value="inline-right">Inline Right</option>
          <option value="full-width">Full Width</option>
          <option value="two-column-left">Two Column Left</option>
          <option value="two-column-right">Two Column Right</option>
          <option value="three-column">Three Column</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {!section.mermaid_chart && <button onClick={handleGenerateDiagram} className="px-4 py-2 text-sm bg-teal-500 text-white rounded-md">Add Diagram</button>}
        {section.mermaid_chart && <button onClick={handleRemoveDiagram} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md">Remove Diagram</button>}
        <button onClick={() => openImagePicker(section.id)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Add Image</button>
        <button onClick={toggleEdit} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md">{editor?.isEditable ? 'Save' : 'Edit'}</button>
        <button onClick={() => openAiDialog(section.id)} className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md">AI Enhance</button>
        <button onClick={() => openVersionHistoryModal(section.id)} className="px-4 py-2 text-sm bg-purple-500 text-white rounded-md">History</button>
        <button onClick={handleDeleteSection} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md">Delete</button>
        {suggestedChart && <button onClick={() => openChartWizardForSection(section.id, suggestedChart)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md">Visualize as {suggestedChart}</button>}
      </div>
    </div>
  );
}