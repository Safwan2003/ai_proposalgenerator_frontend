'use client';

import { useProposalStore } from '@/store/proposalStore';
import { updateImagePlacement } from '@/lib/api';

export default function SectionImages({ section, handleDeleteImage, proposalId }) {
  const { updateSectionImagePlacement } = useProposalStore();

  const handlePlacementChange = async (sectionId, placement) => {
    // Optimistically update the UI
    updateSectionImagePlacement(sectionId, placement);

    try {
      if (proposalId) {
        await updateImagePlacement(proposalId, sectionId, placement);
      }
    } catch (error) {
      console.error('Error updating image placement:', error);
      // Revert the UI change if the API call fails
      // For simplicity, we'll just alert the user. A more robust solution would be to refetch the section data.
      alert('Error updating image placement. Please try again.');
    }
  };

  const getPlacementClass = (placement) => {
    switch (placement) {
      case 'full-width':
        return 'col-span-full';
      case 'inline-left':
        return 'col-span-1';
      case 'inline-right':
        return 'col-span-1 col-start-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className={`mt-4 grid grid-cols-2 gap-3`}>
      {(section.image_urls || []).map((image, index) => (
        <div key={index} className={`relative w-full h-48 rounded-md overflow-hidden shadow-sm group ${getPlacementClass(section.image_placement)}`}>
          <img src={image} alt={`section image ${index + 1}`} className="w-full h-full object-cover" />
          <button
            onClick={() => handleDeleteImage(section.id, image)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            X
          </button>
        </div>
      ))}
      {section.image_urls && section.image_urls.length > 0 && (
        <div className="col-span-full mt-2">
          <label htmlFor={`placement-${section.id}`} className="block text-sm font-medium text-gray-700">Image Placement</label>
          <select
            id={`placement-${section.id}`}
            value={section.image_placement || 'inline-left'}
            onChange={(e) => handlePlacementChange(section.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="full-width">Full Width</option>
            <option value="inline-left">Inline Left</option>
            <option value="inline-right">Inline Right</option>
          </select>
        </div>
      )}
    </div>
  );
}
