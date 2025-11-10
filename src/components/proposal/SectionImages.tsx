'use client';

interface ImageItem {
  id: number;
  url: string;
  alt?: string;
  placement?: string | null;
}

interface SectionImagesProps {
  section: {
    id: number;
    image_placement?: string | null;
    images?: ImageItem[];
  };
  handleDeleteImage: (sectionId: number, imageId: number) => void;
  proposalId?: number | null;
}

export default function SectionImages({ section, handleDeleteImage, proposalId: _proposalId }: SectionImagesProps) {
  const getPlacementClass = (placement?: string | null) => {
    switch (placement) {
      case 'full-width-top':
      case 'full-width-bottom':
        return 'col-span-2';
      case 'inline-left':
        return 'col-span-1';
      case 'inline-right':
        return 'col-span-1 col-start-2';
      default:
        return 'col-span-1';
    }
  };

  const handleDelete = (sectionId: number, imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      handleDeleteImage(sectionId, imageId);
    }
  };

  if (!section.images || section.images.length === 0) return null;

  return (
    <div className={`mt-4 grid grid-cols-2 gap-3`}>
      {section.images.map((image) => (
        <div key={image.id} className={`relative w-full rounded-md shadow-sm group ${getPlacementClass(section.image_placement)}`}>
          <img
            src={image.url}
            alt={image.alt || 'section image'}
            className="w-full h-auto object-contain"
            onError={(e) => console.error('Image failed to load:', image.url, e)}
          />
          <button
            onClick={() => handleDelete(section.id, image.id)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}

    </div>
  );
}
