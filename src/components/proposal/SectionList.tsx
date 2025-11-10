'use client';

import React from 'react';
import { useProposalStore } from '@/store/proposalStore';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import SectionCard from './SectionCard';
import { reorderSections as reorderSectionsApi } from '@/lib/api';
import { Section } from '@/types/proposal'; // Add this type

interface SectionListProps {
  proposalId: number;
  openAiDialog: (sectionId: number) => void;
  openImagePicker: (sectionId: number) => void;
  openChartWizardForSection: (sectionId: number) => void;
  handleRemoveTechLogo: (sectionId: number, logoUrl: string) => void;
  handleAddSectionAtIndex: (index: number) => void;
}
  
export default function SectionList({
  proposalId,
  openAiDialog,
  openImagePicker,
  openChartWizardForSection,
  handleRemoveTechLogo,
  handleAddSectionAtIndex,
}: SectionListProps) {
    const { sections, reorderSections } = useProposalStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      try {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over?.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          console.error('Invalid section indices during reordering');
          return;
        }

        const newSections = arrayMove(sections, oldIndex, newIndex);
        reorderSections(newSections);

        const reorderRequests = newSections.map((section, index) => ({
          sectionId: section.id,
          newOrder: index + 1,
        }));

        if (proposalId) {
          await reorderSectionsApi(proposalId, reorderRequests);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error reordering sections:', error.response?.status, error.response?.data);
        } else {
          console.error('Error reordering sections:', error);
        }
        // Optionally revert the UI state if the API call fails
        reorderSections(sections);
      }
    }
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow-inner text-center">
        <p className="text-gray-500">No sections available</p>
      </div>
    );
  }

  return (
    <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Proposal Sections
      </h2>
      <DndContext 
        key={sections.map(s => s.id).join('-')} // Add key to reset context when sections change
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sections.map((s) => s.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.filter(section => section && section.id).sort((a, b) => b.order - a.order).map((section, index) => (
              <React.Fragment key={section.id}>
                <SectionCard
                  section={section}
                  proposalId={proposalId}
                  openAiDialog={openAiDialog}
                  openImagePicker={openImagePicker}
                  openChartWizardForSection={openChartWizardForSection}
                  handleRemoveTechLogo={handleRemoveTechLogo}
                />
                <div 
                  className="relative h-8 flex items-center justify-center group"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                >
                  <button
                    onClick={() => handleAddSectionAtIndex(index + 1)}
                    className="absolute bg-blue-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    title="Add section here"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
                </React.Fragment>
            ))}
            {/* Add section button for the very end of the list */}
            <div 
              className="relative h-8 flex items-center justify-center group"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            >
              <button
                onClick={() => handleAddSectionAtIndex(sections.length)}
                className="absolute bg-blue-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                title="Add section at the end"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
