
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Section } from '@/types/proposal';

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
  sections: { id: number; title: string; contentHtml: string; image_urls: string[]; order: number; image_placement: string | null; mermaid_chart: string | null; layout: string | null }[];
  tech_stack: { name: string; logo_url: string }[];
  chartTheme: 'default' | 'neutral' | 'dark' | 'forest';

  setField: <K extends keyof ProposalState>(field: K, value: ProposalState[K]) => void;
  setChartTheme: (theme: 'default' | 'neutral' | 'dark' | 'forest') => void;
  setSections: (sections: Section[]) => void;

  updateSection: (section: Section) => void;
  updateSectionContent: (id: number, content: string) => void;
  reorderSections: (sections: Section[]) => void;
  addImageToSection: (sectionId: number, imageUrl: string) => void;
  deleteSection: (sectionId: number) => void;
  removeImageFromSection: (sectionId: number, imageUrl: string) => void;
  updateSectionImagePlacement: (sectionId: number, placement: string) => void;
  updateSectionMermaidChart: (sectionId: number, chart: string) => void;
  updateSectionLayout: (sectionId: number, layout: string) => void;
  addTechLogoToSection: (sectionId: number, techLogo: { name: string; logo_url: string }) => void;
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
      setSections: (sections) => set({ sections }),
      setTechStack: (tech_stack) => set({ tech_stack }),
      updateSection: (section) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.id === section.id ? section : s)),
        })),
      updateSectionContent: (id, content) =>
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, contentHtml: content } : s)),
        })),
      reorderSections: (sections) => set({ sections }),
      addImageToSection: (sectionId, imageUrl) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, image_urls: [...s.image_urls, imageUrl] } : s
          ),
        })),
      deleteSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== sectionId),
        })),
      removeImageFromSection: (sectionId, imageUrl) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, image_urls: s.image_urls.filter((img) => img !== imageUrl) } : s
          ),
        })),
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
    }),
    { name: 'ProposalStore' }
  )
);

