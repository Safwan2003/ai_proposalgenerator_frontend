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

export const searchTechLogos = async (query: string) => {
  const { data } = await apiClient.get(`/images/tech-logos/search`, {
    params: { query },
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



export const getProposalPreviewHtml = async (proposalId: number): Promise<string> => {
  const { data } = await apiClient.get(`/proposals/${proposalId}/preview`, {
    responseType: 'text', // Ensure we get the HTML as a string
  });
  return data;
};


// ... (existing imports and apiClient setup)

// --- GENERIC AI TASK ORCHESTRATOR ---

const performAiTask = async (proposalId: number, task_name: string, context: object) => {
  const { data } = await apiClient.post(`/proposals/${proposalId}/ai-task`, {
    task_name,
    context,
  });
  return data;
};

// ... (existing non-AI functions like createProposal, deleteSection, etc.)

// --- REFACIORED AI FUNCTIONS ---

export const aiEnhanceSection = (proposalId: number, sectionId: number, action: string, tone: string) => {
  return apiClient.post(`/proposals/${proposalId}/sections/${sectionId}/enhance`, { action, tone });
};

export const generateContentForSection = (proposalId: number, sectionId: number, keywords: string) => {
  return performAiTask(proposalId, 'generate_content', { sectionId, keywords });
};



export const suggestChartType = (proposalId: number, sectionId: number) => {
  return performAiTask(proposalId, 'suggest_chart', { sectionId });
};

export const generateChart = (proposalId: number, description: string, chartType: string, sectionId?: number) => {
    return performAiTask(proposalId, 'generate_chart', { description, chart_type: chartType, section_id: sectionId });
};

export const updateChart = (proposalId: number, sectionId: number, prompt: string, current_chart_code: string) => {
    return performAiTask(proposalId, 'update_chart', { section_id: sectionId, prompt, current_chart_code });
};

export const generateChartForSection = (proposalId: number, sectionId: number, description: string, chartType: string) => {
    return performAiTask(proposalId, 'generate_chart', { section_id: sectionId, description, chart_type: chartType });
};

export const fixChart = (proposalId: number, sectionId: number, mermaidCode: string) => {
  return performAiTask(proposalId, 'fix_chart', { section_id: sectionId, mermaid_code: mermaidCode });
};

// Note: The original generateProposalDraft is more complex and has been left for now.
// Other non-AI functions (reorder, export, etc.) remain unchanged.
