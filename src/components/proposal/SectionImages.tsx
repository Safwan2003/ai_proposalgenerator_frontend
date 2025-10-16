'use client';

import { useProposalStore } from '@/store/proposalStore';
import { updateImagePlacement } from '@/lib/api';

export default function SectionImages({ section, handleDeleteImage, proposalId }) {
  console.log("SectionImages - image_urls:", section.image_urls);
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
        <div key={index} className={`relative w-full rounded-md shadow-sm group ${getPlacementClass(section.image_placement)}`}>
          <img 
            src={image} 
            alt={`section image ${index + 1}`} 
            className="w-full h-auto object-contain" 
            onError={(e) => console.error('Image failed to load:', image, e)}
          />
          <button
            onClick={() => handleDeleteImage(section.id, image)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            X
          </button>
        </div>
      ))}

    </div>
  );
}
