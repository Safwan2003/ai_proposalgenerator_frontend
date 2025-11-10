import { useProposalStore } from '@/store/proposalStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const createProposal = async (proposalData: any) => {
  const response = await axios.post(`${API_URL}/proposals`, proposalData);
  return response.data;
};

export const generateProposalDraft = async (proposalId: number, sections: string[]) => {
  const response = await axios.post(`${API_URL}/proposals/${proposalId}/generate`, { sections });
  console.log("Response from generateProposalDraft:", response.data);
  return response.data;
};

export const aiEnhanceSection = async (sectionId: number, enhancement_type: string) => {
  const response = await axios.post(`${API_URL}/ai/enhance_section`, {
    section_id: sectionId,
    enhancement_type: enhancement_type,
  });
  return response.data;
};

export const addImage = async (sectionId: number, imageUrl: string) => {
  const response = await axios.post(`${API_URL}/images/sections/${sectionId}/images`, { url: imageUrl });
  return response.data;
};

export const generateChartForSection = async (sectionId: number, description: string, chartType: string) => {
  const response = await axios.post(`${API_URL}/diagrams/generate_chart`, {
    section_id: sectionId,
    description: description,
    chart_type: chartType,
  });
  return response.data;
};

export const getProposal = async (proposalId: number) => {
    const response = await axios.get(`${API_URL}/proposals/${proposalId}`);
    return response.data;
  };
  
export const removeImage = async (sectionId: number, imageId: number) => {
  const response = await axios.delete(`${API_URL}/images/sections/${sectionId}/images`, { data: { id: imageId } });
  return response.data;
};

export const updateSectionApi = async (sectionId: number, sectionData: any) => {
    const dataToSend = { ...sectionData };

    if (dataToSend.images && Array.isArray(dataToSend.images)) {
      dataToSend.image_urls = dataToSend.images.map((img: any) => img.url);
      delete dataToSend.images;
    }

    const response = await axios.put(`${API_URL}/sections/${sectionId}`, dataToSend);
    return response.data;
  };

// Update only image placement convenience helper
export const updateImagePlacement = async (sectionId: number, placement: string) => {
  const response = await axios.put(`${API_URL}/sections/${sectionId}`, { image_placement: placement });
  return response.data;
};

export const searchImages = async (query: string, provider: string = 'pixabay') => {
  const response = await axios.get(`${API_URL}/images/search`, {
    params: { query, provider },
  });
  return response.data;
};

export const getUserImages = async () => {
  const response = await axios.get(`${API_URL}/user-images/`);
  return response.data;
};

export const createUserImage = async (imageData: { url: string; tags: string }) => {
  const response = await axios.post(`${API_URL}/user-images/`, imageData);
  return response.data;
};

export const deleteUserImage = async (imageId: number) => {
  const response = await axios.delete(`${API_URL}/user-images/${imageId}`);
  return response.data;
};

export const getImageProviders = async () => {
  try {
    const response = await axios.get(`${API_URL}/images/providers`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching image providers:", error.response?.status, error.response?.data);
    } else {
      console.error("Error fetching image providers:", error);
    }
    throw error; // Re-throw the error so the calling component can handle it if needed
  }
};

export const searchTechLogos = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/images/tech-logos/search`, {
      params: { query },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error searching tech logos:", error.response?.status, error.response?.data);
    } else {
      console.error("Error searching tech logos:", error);
    }
    throw error; // Re-throw the error so the calling component can handle it if needed
  }
};

export const deleteSection = async (sectionId: number) => {
  const response = await axios.delete(`${API_URL}/sections/${sectionId}`);
  return response.data;
};

export const reorderSections = async (reorderRequests: any) => {
  const response = await axios.post(`${API_URL}/sections/reorder`, reorderRequests);
  return response.data;
};

export const updateProposal = async (proposalId: number, proposalData: any) => {
  const response = await axios.patch(`${API_URL}/proposals/${proposalId}`, proposalData);
  return response.data;
};

export const addSection = async (proposalId: number, sectionData: { title: string; order?: number }) => {
  const response = await axios.post(`${API_URL}/proposals/${proposalId}/sections`, sectionData);
  return response.data;
};