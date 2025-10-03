
'use client';

import { useProposalStore } from '@/store/proposalStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SectionCard from './SectionCard';
import { reorderSections as reorderSectionsApi } from '@/lib/api';

export default function SectionList({ proposalId, openAiDialog, openImagePicker, openVersionHistoryModal }) {
  const { sections, reorderSections } = useProposalStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      reorderSections(newSections);

      // Call backend to update order
      const reorderRequests = newSections.map((section, index) => ({
        sectionId: section.id,
        newOrder: index + 1,
      }));
      // Assuming proposalId is passed as a prop to SectionList
      if (proposalId) {
        reorderSectionsApi(proposalId, reorderRequests);
      }
    }
  }

  return (
    <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Proposal Sections</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} proposalId={proposalId} openAiDialog={openAiDialog} openImagePicker={openImagePicker} openVersionHistoryModal={openVersionHistoryModal} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
