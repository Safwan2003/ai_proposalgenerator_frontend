import axios from 'axios';
import { useProposalStore } from '@/store/proposalStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DesignSuggestion {
  prompt: string;
  css: string;
  metadata: {
    primary_color: string;
    secondary_color: string;
    font: string;
    tone: string;
    layout_style: string;
    header_style: string;
    section_style: string;
    visual_description: string;
  };
}

/**
 * ------------------------------
 * Proposals
 * ------------------------------
 */
export const createProposal = async (proposalData) => {
  const { data } = await apiClient.post('/proposals', proposalData);
  return data;
};

export const generateProposalDraft = async (proposalId: number) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/generate`);
  return data;
};

/**
 * ------------------------------
 * Sections
 * ------------------------------
 */
export const aiEnhanceSection = async (
  proposalId: number,
  sectionId: number,
  action: string,
  tone: string
) => {
  const { data } = await apiClient.post(
    `/proposals/${proposalId}/sections/${sectionId}/ai-enhance`,
    {},
    { params: { action, tone } }
  );
  return data;
};

export const deleteSection = async (proposalId: number, sectionId: number) => {
  const { data } = await apiClient.delete(`/proposals/${proposalId}/sections/${sectionId}`);
  return data;
};

export const reorderSections = async (
  proposalId: number,
  reorderRequests: Array<{ sectionId: number; newOrder: number }>
) => {
  const { data } = await apiClient.patch(`/proposals/${proposalId}/reorder`, reorderRequests);
  return data;
};

export const getSectionVersions = async (sectionId: number) => {
  const { data } = await apiClient.get(`/sections/${sectionId}/versions`);
  return data;
};

export const revertSection = async (sectionId: number, versionId: number) => {
  const { data } = await apiClient.post(`/sections/${sectionId}/revert/${versionId}`);
  return data;
};

export const addNewSection = async (
  proposalId: number,
  sectionData: { title: string; contentHtml: string; order: number }
) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections`, sectionData);
  return data;
};

export const updateSectionApi = async (
  proposalId: number,
  sectionId: number,
  sectionData: { title?: string; contentHtml?: string; mermaid_chart?: string; layout?: string }
) => {
  const { data } = await apiClient.patch(`/proposals/${proposalId}/sections/${sectionId}`, sectionData);
  return data;
};

export const generateContentForSection = async (
  proposalId: number,
  sectionId: number,
  keywords: string
) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections/generate-content`, {
    section_id: sectionId,
    keywords,
  });
  return data;
};

/**
 * ------------------------------
 * Proposal Export / Apply Design
 * ------------------------------
 */
export const exportProposal = async (proposalId: number, format: string) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/export`, null, {
    params: { format },
  });
  return data;
};

export const applyDesign = async (proposalId: number, css: string) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/apply-design`, {
    css: css,
  });
  return data;
};

/**
 * ------------------------------
 * Images
 * ------------------------------
 */
export const searchImages = async (query: string, provider: string) => {
  const { data } = await apiClient.get(`/images/search`, {
    params: { query: query, provider },
  });
  return data;
};

export const getImageProviders = async () => {
  const { data } = await apiClient.get(`/images/providers`);
  return data;
};

export const addImage = async (proposalId: number, sectionId: number, imageUrl: string) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections/${sectionId}/images`, { url: imageUrl });
  return data;
};

export const removeImage = async (proposalId: number, sectionId: number, imageUrl: string) => {
  const { data } = await apiClient.delete(`/proposals/${proposalId}/sections/${sectionId}/images`, {
    data: { url: imageUrl },
  });
  return data;
};

export const updateImagePlacement = async (proposalId: number, sectionId: number, placement: string) => {
  const { data } = await apiClient.patch(`/proposals/${proposalId}/sections/${sectionId}/image-placement`, {
    image_placement: placement,
  });
  return data;
};


/**
 * ------------------------------
 * Other
 * ------------------------------
 */
export const getProposal = async (proposalId: number) => {
  const { data } = await apiClient.get(`/proposals/${proposalId}`);
  return data;
};

export const getDesignSuggestions = async (proposalId: number): Promise<DesignSuggestion[]> => {
  const { data } = await apiClient.get(`/proposals/${proposalId}/design-suggestions`);
  return data;
};

export const liveCustomizeDesign = async (proposalId: number, prompt: string): Promise<DesignSuggestion> => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/live-customize`, { prompt });
  return data;
};

export const getProposalPreviewHtml = async (proposalId: number): Promise<string> => {
  const { data } = await apiClient.get(`/proposals/${proposalId}/preview`, {
    responseType: 'text', // Ensure we get the HTML as a string
  });
  return data;
};

export const generateChart = async (proposalId: number, description: string, chartType: 'flowchart' | 'gantt' | 'sequence' | 'mindmap', sectionId?: number) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/charts`, {
    description,
    chart_type: chartType,
    section_id: sectionId,
  });
  return data;
};

export const suggestChartType = async (proposalId: number, sectionId: number) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections/${sectionId}/suggest-chart`);
  return data;
};

export const updateChart = async (proposalId: number, sectionId: number, prompt: string, current_chart_code: string) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections/${sectionId}/update-chart`, {
    prompt,
    current_chart_code,
  });
  return data;
};

export const generateChartForSection = async (proposalId: number, sectionId: number, description: string, chartType: 'flowchart' | 'gantt') => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/sections/${sectionId}/generate-chart`, {
    description,
    chart_type: chartType,
  });
  return data;
};