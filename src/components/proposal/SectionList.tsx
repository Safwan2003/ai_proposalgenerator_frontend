'use client';

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
  openVersionHistoryModal: (sectionId: number) => void;
  openChartWizardForSection: (sectionId: number) => void;
}

export default function SectionList({ 
  proposalId, 
  openAiDialog, 
  openImagePicker, 
  openVersionHistoryModal, 
  openChartWizardForSection 
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
        console.error('Error reordering sections:', error);
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
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                proposalId={proposalId}
                openAiDialog={openAiDialog}
                openImagePicker={openImagePicker}
                openVersionHistoryModal={openVersionHistoryModal}
                openChartWizardForSection={openChartWizardForSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
