
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Section } from '@/types/proposal';

// Note: API calls for removing images are performed by UI components;
// the store's removeImageFromSection only updates local state (optimistic update).

// Define the state shape
interface ProposalState {
  clientName: string;
  rfpText: string;
  totalAmount: number;
  paymentType: 'one-time' | 'monthly' | 'recurring';
  numDeliverables: number;
  startDate: string;
  endDate: string;
  companyInfo: { name: string; logoUrl: string; contact: string };
  sections: { id: number; title: string; contentHtml: string; images: { id: number; url: string; alt: string; placement: string }[]; order: number; image_placement: string | null; mermaid_chart: string | null; layout: string | null; tech_logos: { name: string; logo_url: string }[] }[];
  tech_stack: { name: string; logo_url: string }[];
  chartTheme: 'default' | 'neutral' | 'dark' | 'forest';

  setField: <K extends keyof ProposalState>(field: K, value: ProposalState[K]) => void;
  setChartTheme: (theme: 'default' | 'neutral' | 'dark' | 'forest') => void;
  setSections: (sections: Section[]) => void;

  updateSection: (section: Section) => void;
  updateSectionContent: (id: number, content: string) => void;
  reorderSections: (sections: Section[]) => void;
  addImageToSection: (sectionId: number, image: { id: number; url: string; alt: string; placement: string }) => void;
  deleteSection: (sectionId: number) => void;
  removeImageFromSection: (sectionId: number, imageId: number) => void;
  updateSectionImagePlacement: (sectionId: number, placement: string) => void;
  updateSectionMermaidChart: (sectionId: number, chart: string) => void;
  updateSectionLayout: (sectionId: number, layout: string) => void;
  addTechLogoToSection: (sectionId: number, techLogo: { name: string; logo_url: string }) => void;
  addSection: (section: Section) => void;
  removeTechLogoFromSection: (sectionId: number, logoUrl: string) => void;
  setTechStack: (tech_stack: { name: string; logo_url: string }[]) => void;
}

export const useProposalStore = create<ProposalState>()(
  devtools(
    (set) => ({
      clientName: 'Acme Corp',
      rfpText: 'Acme Corp is looking for an AI-powered solution to automate their proposal generation process.',
      totalAmount: 15000.00,
      paymentType: 'one-time',
      numDeliverables: 5,
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      companyInfo: { name: 'AI Solutions Inc.', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png', contact: 'info@aisolutions.com' },
      sections: [],
      tech_stack: [],
      chartTheme: 'default',

      setField: (field, value) => set({ [field]: value }),
      setChartTheme: (theme) => set({ chartTheme: theme }),
      setSections: (sections) => {
        console.log("Setting sections in proposal store:", sections);
        set((state) => ({
          sections: Array.isArray(sections) ? sections.map(s => ({ ...s })) : []
        }));
      },
      setTechStack: (tech_stack) => set({ tech_stack }),
      addSection: (section) => set((state) => ({ sections: [...state.sections, section] })),
      updateSection: (section) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.id === section.id ? section : s)),
        })),
      updateSectionContent: (id, content) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, contentHtml: content } : s)),
        })),
      reorderSections: (newlyOrderedSections) => set((state) => ({
        sections: Array.isArray(newlyOrderedSections) 
          ? newlyOrderedSections.map((s, index) => ({ ...s, order: index + 1 })) 
          : state.sections
      })),
      addImageToSection: (sectionId, image) =>
        set((state) => ({
          sections: state.sections.map((s) =>
          s.id === sectionId
            ? { ...s, images: [...(Array.isArray(s.images) ? s.images : []), image] }
            : s          ),
        })),
      deleteSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== sectionId),
        })),
      removeImageFromSection: (sectionId, imageId) => {
        // Only update local state; the caller (component) will perform the API request
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, images: s.images.filter((img) => img.id !== imageId) } : s
          ),
        }));
      },
      updateSectionImagePlacement: (sectionId, placement) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, image_placement: placement } : s
          ),
        })),
      updateSectionMermaidChart: (sectionId, chart) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, mermaid_chart: chart } : s
          ),
        })),
      updateSectionLayout: (sectionId, layout) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, layout: layout } : s
          ),
        })),
      addTechLogoToSection: (sectionId, techLogo) =>
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.id === sectionId) {
              const newTechLogos = Array.isArray(techLogo) ? techLogo : [techLogo];
              return { ...s, tech_logos: [...s.tech_logos, ...newTechLogos] };
            }
            return s;
          }),
        })),
      removeTechLogoFromSection: (sectionId, logoUrl) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, tech_logos: (s.tech_logos || []).filter((logo) => logo.logo_url !== logoUrl) } : s
          ),
        })),
    }),
    { name: 'ProposalStore' }
  )
);
