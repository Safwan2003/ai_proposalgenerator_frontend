'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProposalStore } from '@/store/proposalStore';
import { deleteSection as deleteSectionApi, removeImage, updateSectionApi, updateChart, generateChartFromContent } from '@/lib/api';
import { useEffect, useState, useCallback, useRef } from 'react';
import SectionImages from './SectionImages';
import TableMenuBar from './TableMenuBar';
import { suggestChartType } from '@/lib/api';
import { debounce } from 'lodash';

import dynamic from 'next/dynamic';
const MermaidChart = dynamic(() => import('../MermaidChart'), { ssr: false });
import InteractiveMermaid from '../InteractiveMermaid';
import ChartDisplayModal from '../ui/ChartDisplayModal';

import { FaPlus, FaTrash, FaImage, FaEdit, FaSave, FaMagic } from 'react-icons/fa';

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
  openChartWizardForSection: (sectionId: number) => void;
  handleRemoveTechLogo: (sectionId: number, logoUrl: string) => void;
}

export default function ClientSideSectionCard({ section: initialSection, proposalId, openAiDialog, openImagePicker, openChartWizardForSection, handleRemoveTechLogo }: ClientSideSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: initialSection.id });
  const { updateSectionContent, deleteSection, removeImageFromSection, addImageToSection, updateSectionMermaidChart, updateSectionImagePlacement, updateSection, sections } = useProposalStore();

  const section = sections.find(s => s.id === initialSection.id) || initialSection; // Get the latest section from the store

  const [editableMermaidContent, setEditableMermaidContent] = useState(section.mermaid_chart || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestedChart, setSuggestedChart] = useState<string | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const handleSaveMermaid = async (newChart: string) => {
    updateSectionMermaidChart(section.id, newChart);
    if (proposalId) {
    await updateSectionApi(section.id, { mermaid_chart: newChart });
    }
  };

  const debouncedSuggestChart = useRef(
    debounce(async (content) => {
      if (proposalId && section.id) {
        const suggestion = await suggestChartType(proposalId, section.id);
        if (suggestion && suggestion !== 'none') {
          setSuggestedChart(suggestion);
        } else {
          setSuggestedChart(null);
        }
      }
    }, 1000) // 1 second debounce
  ).current;

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
          await updateSectionApi(section.id, { contentHtml: newHtml, mermaid_chart: editableMermaidContent });
        }
      }
    },
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      if (editor && !editor.isDestroyed && section.contentHtml !== editor.getHTML()) {
        editor.commands.setContent(section.contentHtml, false);
      }
      if (section.mermaid_chart !== editableMermaidContent) {
        setEditableMermaidContent(section.mermaid_chart || '');
      }
    } catch (e) {
      console.error("Error updating section card editor:", e);
    }
  }, [section.contentHtml, section.mermaid_chart, editor]);

  const toggleEdit = async () => {
    console.log("toggleEdit called");
    if (!editor) {
      console.log("Editor not initialized");
      return;
    }
    const isEditable = !editor.isEditable;
    console.log("Current editor editable state:", editor.isEditable, "New state:", isEditable);
    editor.setEditable(isEditable);
    if (!isEditable) { // Just exited edit mode
      console.log("Exited edit mode, saving content...");
      const newHtml = editor.getHTML();
      updateSectionContent(section.id, newHtml);
      updateSectionMermaidChart(section.id, editableMermaidContent);
      if (proposalId) {
        console.log("Calling updateSectionApi...");
  await updateSectionApi(section.id, { contentHtml: newHtml, mermaid_chart: editableMermaidContent });
        console.log("updateSectionApi called.");
      }
    }
    console.log("toggleEdit finished.");
  };

  const handleDeleteImage = async (sectionId: number, imageId: number) => {
    // Optimistically remove the image from the UI
    removeImageFromSection(sectionId, imageId);

    try {
      const updated = await removeImage(sectionId, imageId);
      updateSection(updated);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Revert the UI change if the API call fails
      const image = section.images.find(img => img.id === imageId);
      if (image) {
        addImageToSection(sectionId, image);
      }
      alert('Error deleting image. Please try again.');
    }
  };

  // Image selection handled at parent level via ImagePickerModal

  const handleDeleteSection = async () => {
    if (!proposalId) return;
    deleteSection(section.id);
  await deleteSectionApi(section.id);
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
  await updateSectionApi(section.id, { mermaid_chart: '' });
  };

  const chartType = (section as any).chartType || getChartType(section.mermaid_chart || '');

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
        <div className="mt-4">
          <InteractiveMermaid initialChart={section.mermaid_chart} onSave={handleSaveMermaid} />
        </div>
      )}

      <ChartDisplayModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        chartCode={section.mermaid_chart || ''}
        chartType={chartType}
      />

  {section.images && section.images.length > 0 && <SectionImages section={section} handleDeleteImage={handleDeleteImage} proposalId={proposalId} />}

      {section.title.toLowerCase().includes('technology stack') && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Technologies Used:</h4>
          <div className="flex flex-wrap gap-4 items-center">
            {section.tech_logos && Array.isArray(section.tech_logos) && section.tech_logos.map((tech, index) => (
              <div key={index} className="relative flex items-center space-x-2 p-2 border border-gray-200 rounded-md bg-white shadow-sm">
                {tech.logo_url ? (
                  <img src={tech.logo_url} alt={tech.name} className="h-8 w-8 object-contain" />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md text-xs font-semibold">{tech.name.charAt(0)}</div>
                )}
                <span className="text-sm font-medium text-gray-800">{tech.name}</span>
                <button
                  onClick={() => handleRemoveTechLogo(section.id, tech.logo_url)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold leading-none"
                  aria-label="Remove tech logo"
                >
                  &times;
                </button>
              </div>
            ))}
            <button onClick={() => openImagePicker(section.id)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Add Tech Logo</button>
          </div>
        </div>
      )}

      {section.images && section.images.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium">Image Placement</label>
          <select
            value={section.image_placement || 'full-width-top'}
            onChange={(e) => updateSectionImagePlacement(section.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="full-width-top">Full Width Top</option>
            <option value="full-width-bottom">Full Width Bottom</option>
          </select>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {!section.mermaid_chart && <button onClick={handleGenerateDiagram} className="p-2 text-sm bg-teal-500 text-white rounded-md"><FaPlus /></button>}
        {section.mermaid_chart && <button onClick={handleRemoveDiagram} className="p-2 text-sm bg-red-500 text-white rounded-md"><FaTrash /></button>}
        <button onClick={() => openImagePicker(section.id)} className="p-2 text-sm bg-gray-100 rounded-md"><FaImage /></button>
        <button onClick={toggleEdit} className="p-2 text-sm bg-blue-500 text-white rounded-md">{editor?.isEditable ? <FaSave /> : <FaEdit />}</button>
        <button onClick={() => openAiDialog(section.id)} className="p-2 text-sm bg-indigo-500 text-white rounded-md"><FaMagic /></button>
        <button onClick={handleDeleteSection} className="p-2 text-sm bg-red-500 text-white rounded-md"><FaTrash /></button>
  {suggestedChart && <button onClick={() => openChartWizardForSection(section.id)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md">Visualize as {suggestedChart}</button>}
      </div>
    </div>
  );
}