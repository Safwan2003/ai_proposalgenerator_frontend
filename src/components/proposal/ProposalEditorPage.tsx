'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProposalStore } from '@/store/proposalStore';
import { createProposal, generateProposalDraft, aiEnhanceSection, addImage, generateChartForSection, getProposal, updateSectionApi, exportProposalDocx, fixChart, updateProposal } from '@/lib/api';
import SectionList from './SectionList';
import AIDialog from '../ui/AIDialog';
import ImagePickerModal from '../ui/ImagePickerModal';
import ChartWizardModal from '../ui/ChartWizardModal';
import ClassicTemplate from '@/templates/ClassicTemplate';
import ModernTemplate from '@/templates/ModernTemplate';
import ElegantCenteredTemplate from '@/templates/ElegantCenteredTemplate';
import RedlineTemplate from '@/templates/RedlineTemplate';
import Toast from '../ui/Toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

type TemplateKey = 'ClassicTemplate' | 'ModernTemplate' | 'ElegantCenteredTemplate' | 'RedlineTemplate';
const templates: Record<TemplateKey, any> = {
  ClassicTemplate,
  ModernTemplate,
  ElegantCenteredTemplate,
  RedlineTemplate,
};

export default function ProposalEditorPage() {
  const router = useRouter();
  const { 
    clientName, rfpText, totalAmount, paymentType, numDeliverables, startDate, endDate, companyInfo, sections, 
    setField, setSections, addImageToSection, updateSectionContent, removeImageFromSection, updateSectionMermaidChart, 
    updateSection, setTechStack, addTechLogoToSection, removeTechLogoFromSection, addSection
  } = useProposalStore();

  const [proposalId, setProposalId] = useState<number | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isChartWizardOpen, setChartWizardOpen] = useState(false);
  const [selectedSectionForChart, setSelectedSectionForChart] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('ClassicTemplate');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (proposalId) {
      setLoading(true);
      getProposal(proposalId)
        .then((data) => {
          setField('clientName', data.clientName);
          setField('rfpText', data.rfpText);
          setField('totalAmount', data.totalAmount);
          setField('paymentType', data.paymentType);
          setField('numDeliverables', data.numDeliverables);
          setField('startDate', data.startDate);
          setField('endDate', data.endDate);
          setField('companyInfo', { name: data.companyName, logoUrl: data.companyLogoUrl, contact: data.companyContact });
          setSections(data.sections);
          setTechStack(data.tech_stack);

        })
        .catch((err) => {
          console.error("Failed to fetch proposal", err);
          setErrors({ form: "Failed to load proposal data." });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [proposalId, setField, setSections, setTechStack]);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!clientName) newErrors.clientName = 'Client name cannot be empty.';
    if (totalAmount <= 0) newErrors.totalAmount = 'Total amount must be a positive number.';
    if (new Date(endDate) < new Date(startDate)) newErrors.endDate = 'End date cannot be before start date.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSectionEditor = () => {
    const defaultSections = [
      "Executive Summary",
      "Product Vision and Overview",
      "Core Functionality and Key Features",
      "User Journey / Workflow",
      "Technology Stack",
      "Development Plan",
      "Payment Milestones",
      "Product Cost & Pricing Breakdown",
      "Timeline & Roadmap",
      "About Us",
      "Path to Partnership"
    ];

    MySwal.fire({
      title: 'Customize Proposal Sections',
      html: `
        <style>
          .swal2-container {
            z-index: 9999; /* Ensure SweetAlert is above other modals */
          }
          .swal2-popup {
            width: 600px !important;
          }
          .swal2-title {
            font-size: 1.8rem !important;
            margin-bottom: 1.5rem !important;
          }
          .section-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
          }
          .section-item input {
            flex-grow: 1;
            border: none;
            background: transparent;
            font-size: 1rem;
            padding: 0.25rem;
            color: #1f2937;
          }
          .section-item input:focus {
            outline: none;
            background-color: #eff6ff;
            border-radius: 0.25rem;
          }
          .remove-btn {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            font-size: 1.25rem;
            margin-left: 0.75rem;
            transition: color 0.2s;
          }
          .remove-btn:hover {
            color: #dc2626;
          }
          .add-section-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 0.75rem 1.5rem;
            margin-top: 1.5rem;
            background-color: #4f46e5;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .add-section-btn:hover {
            background-color: #4338ca;
          }
          .add-section-btn svg {
            margin-right: 0.5rem;
          }
        </style>
        <div id="sections-container" class="space-y-2">
          ${defaultSections.map(section => `
            <div class="section-item">
              <input type="text" value="${section}" class="swal2-input" />
              <button class="remove-btn" type="button">
                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a24 24 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>
              </button>
            </div>
          `).join('')}
        </div>
        <button id="add-section-btn" class="add-section-btn" type="button">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>
          Add Section
        </button>
      `,
      showCancelButton: true,
      confirmButtonText: 'Generate Proposal',
      customClass: {
        popup: 'swal2-no-react-content', // Prevent SweetAlert2 from trying to render React components
      },
      didOpen: () => {
        const container = document.getElementById('sections-container');
        document.getElementById('add-section-btn')?.addEventListener('click', () => {
          const newSectionDiv = document.createElement('div');
          newSectionDiv.className = 'section-item';
          newSectionDiv.innerHTML = `
            <input type="text" placeholder="New section title" class="swal2-input" />
            <button class="remove-btn" type="button">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a24 24 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path></svg>
            </button>
          `;
          container?.appendChild(newSectionDiv);
          newSectionDiv.querySelector('.remove-btn')?.addEventListener('click', () => newSectionDiv.remove());
        });

        container?.querySelectorAll('.remove-btn').forEach(btn => {
          btn.addEventListener('click', () => btn.parentElement?.remove());
        });
      },
      preConfirm: () => {
        const sections = Array.from(document.querySelectorAll('#sections-container input'))
          .map(input => (input as HTMLInputElement).value)
          .filter(value => value.trim() !== '');
        return sections;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const sections = result.value;
        handleGenerateProposal(sections);
      }
    });
  }

  const handleGenerateProposal = async (sections: string[]) => {
    if (!validateFields()) return;
    console.log("Starting proposal generation with sections:", sections);
    setLoading(true);
    setSections([]); // Clear existing sections
    try {
      const proposalData = { clientName, rfpText, totalAmount, paymentType, numDeliverables, startDate, endDate, companyName: companyInfo.name, companyLogoUrl: companyInfo.logoUrl, companyContact: companyInfo.contact };
      console.log("Creating proposal with data:", proposalData);
      const newProposal = await createProposal(proposalData);
      const newProposalId = newProposal.id;
      console.log("Proposal created with ID:", newProposalId);
      setProposalId(newProposalId);

      console.log("Starting draft generation...");
      const updatedProposal = await generateProposalDraft(newProposalId, sections);
      console.log("Draft generation complete. Received proposal:", updatedProposal);
      if (updatedProposal && updatedProposal.sections) {
        setSections(updatedProposal.sections);
        setTechStack(updatedProposal.tech_stack);
      } else {
        console.error("Received invalid proposal data from the backend", updatedProposal);
        setErrors({ ...errors, form: "Failed to generate proposal draft. The backend returned invalid data." });
        setToast({ message: "Failed to generate proposal draft. The backend returned invalid data.", type: "error" });
      }

      setToast({ message: 'Proposal generated successfully!', type: 'success' });

    } catch (error: unknown) {
      console.error("Error during proposal generation:", error);
      let errorMessage = 'An unknown error occurred.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = (error as Error).message;
      }
      setErrors({ ...errors, form: `An error occurred: ${errorMessage}` });
      setToast({ message: `An error occurred: ${errorMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProposal = async () => {
    if (!proposalId || !validateFields()) return;
    setLoading(true);
    try {
      const proposalData = { clientName, rfpText, totalAmount, paymentType, numDeliverables, startDate, endDate, companyName: companyInfo.name, companyLogoUrl: companyInfo.logoUrl, companyContact: companyInfo.contact };
      await updateProposal(proposalId, proposalData);
      setToast({ message: 'Proposal saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Error updating proposal:", error);
      setToast({ message: 'Error saving proposal. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSectionAtIndex = async (index: number) => {
    if (!proposalId) return;
    const title = prompt("Enter the title for the new section:");
    if (title) {
      setLoading(true);
      try {
        const newSection = await addSection(proposalId, { title, order: index });
        // Manually insert the new section into the Zustand store at the correct order
        setSections(currentSections => {
          const updatedSections = [...currentSections];
          updatedSections.splice(index, 0, { ...newSection, order: index });
          // Re-assign orders to maintain consistency after insertion
          return updatedSections.map((s, i) => ({ ...s, order: i }));
        });
        setToast({ message: 'Section added successfully!', type: 'success' });
      } catch (error: unknown) {
        let errorMessage = 'An unknown error occurred while adding the section.';
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.detail || error.message;
          console.error("Error adding section (AxiosError): Status:", error.response?.status, "Data:", error.response?.data, "Message:", error.message);
        } else if (error instanceof Error) {
          errorMessage = error.message;
          console.error("Error adding section:", error.message, error.stack);
        } else {
          console.error("Unknown error adding section:", error);
        }
        setToast({ message: `Error adding section: ${errorMessage}`, type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAiEnhance = async (action: string, tone: string) => {
    if (!selectedSectionId || !proposalId) return;
    setLoading(true);
    try {
      const enhancedSection = await aiEnhanceSection(selectedSectionId, action);
      updateSection(enhancedSection);
      setToast({ message: 'Section enhanced successfully!', type: 'success' });
    } catch (error: unknown) {
      let errorMessage = 'Error enhancing section. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = (error as Error).message;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object' && (error as any).response !== null && 'data' in (error as any).response) {
        errorMessage = (error as any).response.data.detail || errorMessage;
      }
      console.error('Error enhancing section:', error);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
      setAiDialogOpen(false);
    }
  };

  const handleSelectImage = async (item: { type: string; data: any }) => {
    if (selectedSectionId && proposalId) {
              if (item.type === 'image') {
                  const tempImageId = Date.now(); // Generate a temporary ID
                  const newImage = {
                      id: tempImageId,
                      url: item.data.url,
                      alt: item.data.alt || '', // Use provided alt or default to empty string
                      placement: item.data.placement || '', // Use provided placement or default to empty string
                  };
                  addImageToSection(selectedSectionId, newImage);        try {
          await addImage(selectedSectionId, item.data.url);
          setToast({ message: 'Image added successfully!', type: 'success' });
        } catch (error: unknown) {
          let errorMessage = 'Error adding image. Please try again.';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (isErrorWithMessage(error)) {
            errorMessage = (error as Error).message;
          }
          removeImageFromSection(selectedSectionId, item.data.url);
          setToast({ message: errorMessage, type: 'error' });
        }
      } else if (item.type === 'tech_logo') {
        addTechLogoToSection(selectedSectionId, item.data);
        try {
          // Get the latest state after the optimistic update
          const latestSections = useProposalStore.getState().sections;
          const currentSection = latestSections?.find(s => s.id === selectedSectionId);
          if (currentSection) {
            await updateSectionApi(selectedSectionId, { tech_logos: currentSection.tech_logos });
            setToast({ message: 'Tech logo added successfully!', type: 'success' });
          }
        } catch (error: unknown) {
          let errorMessage = 'Error adding tech logo. Please try again.';
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (isErrorWithMessage(error)) {
            errorMessage = (error as Error).message;
          }
          // Revert frontend state if API call fails
          removeTechLogoFromSection(selectedSectionId, item.data.logo_url);
          setToast({ message: errorMessage, type: 'error' });
        }
      }
    }
  };

  const handleRemoveTechLogo = async (sectionId: number, logoUrl: string) => {
    if (!proposalId) return;
    removeTechLogoFromSection(sectionId, logoUrl);
    try {
      // Get the latest state after the optimistic update
      const latestSections = useProposalStore.getState().sections;
      const currentSection = latestSections?.find(s => s.id === sectionId);
      console.log("Current section after local removal:", currentSection);
      if (currentSection) {
        console.log("Sending tech_logos to API:", currentSection.tech_logos);
        await updateSectionApi(sectionId, { tech_logos: currentSection.tech_logos });
        setToast({ message: 'Tech logo removed successfully!', type: 'success' });
      }    } catch (error: unknown) {
      let errorMessage = 'Error removing tech logo. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = (error as Error).message;
      }
      // Revert frontend state if API call fails (re-add the logo)
      const removedLogo = sections?.find(s => s.id === sectionId)?.tech_logos?.find(logo => logo.logo_url === logoUrl);
      if (removedLogo) {
        addTechLogoToSection(sectionId, removedLogo);
      }
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleGenerateChart = async (description: string, chartType: any) => {
    if (!selectedSectionForChart || !proposalId) return;
    setLoading(true);
    try {
      const updatedSection = await generateChartForSection(selectedSectionForChart, description, chartType);
      // Backend returns the updated Section; update the store with it
      updateSection(updatedSection);
      setToast({ message: 'Chart generated successfully!', type: 'success' });
    } catch (error: unknown) {
      let errorMessage = 'Error generating chart. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = (error as Error).message;
      }
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
      setChartWizardOpen(false);
    }
  };

  const handleFixChart = async (mermaidCode: string) => {
    if (!selectedSectionForChart || !proposalId) return;
    setLoading(true);
    try {
      const result = await fixChart(proposalId, selectedSectionForChart, mermaidCode);
      // Support either a Section response or an object with chartCode
      if (result && typeof result === 'object') {
        if ('mermaid_chart' in result) {
          updateSection(result as any);
        } else if ('chartCode' in result) {
          updateSectionMermaidChart(selectedSectionForChart, (result as any).chartCode);
        }
      }
      setToast({ message: 'Chart fixed successfully!', type: 'success' });
    } catch (error: unknown) {
      let errorMessage = 'Error fixing chart. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (isErrorWithMessage(error)) {
        errorMessage = (error as Error).message;
      }
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
      setChartWizardOpen(false);
    }
  };

  const openAiDialog = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setAiDialogOpen(true);
  };

  const openImagePicker = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setImagePickerOpen(true);
  };

  const openChartWizardForSection = (sectionId: number) => {
    setSelectedSectionForChart(sectionId);
    setChartWizardOpen(true);
  };

  const handleExportDocx = async () => {
    if (!proposalId) return;
    setLoading(true);
    try {
      const response = await exportProposalDocx(proposalId);
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${proposalId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setToast({ message: 'Proposal exported successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error exporting proposal.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const SelectedTemplateComponent = templates[selectedTemplate];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Proposal Editor</h1>
        
        {/* Input form remains for user control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  type="text"
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setField('clientName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
                {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="rfpText" className="block text-sm font-medium text-gray-700">RFP Text</label>
                <textarea
                  id="rfpText"
                  value={rfpText}
                  onChange={(e) => setField('rfpText', e.target.value)}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">Total Amount</label>
                <input
                  type="number"
                  id="totalAmount"
                  value={totalAmount}
                  onChange={(e) => setField('totalAmount', parseFloat(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
                {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">Payment Type</label>
                <select
                  id="paymentType"
                  value={paymentType}
                  onChange={(e) => setField('paymentType', e.target.value as 'one-time' | 'monthly' | 'recurring')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setField('endDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
  
            {/* Right Column: Company Info and Deliverables */}
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Info</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyInfo.name}
                    onChange={(e) => setField('companyInfo', { ...companyInfo, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Logo URL"
                    value={companyInfo.logoUrl}
                    onChange={(e) => setField('companyInfo', { ...companyInfo, logoUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Contact Info"
                    value={companyInfo.contact}
                    onChange={(e) => setField('companyInfo', { ...companyInfo, contact: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>
              </div>
  
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Deliverables</h2>
                <input
                  type="number"
                  placeholder="Number of Deliverables"
                  value={numDeliverables}
                  onChange={(e) => setField('numDeliverables', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              </div>
            </div>
        </div>

        {/* --- Streamlined Button Area --- */}
        <div className="mt-10 flex justify-center gap-4 border-t pt-6">
          <button
            onClick={showSectionEditor}
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : '✨ Generate Proposal'}
          </button>
          {proposalId && (
            <button
              onClick={handleUpdateProposal}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          )}

        </div>
        {errors.form && <p className="text-red-500 text-center mt-4">{errors.form}</p>}

        {/* --- Template and Theme Selection --- */}
        {proposalId && (
          <div className="mt-10 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">Select Template</label>
                <select
                  id="template-select"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                >
                  <option value="ClassicTemplate">Classic</option>
                  <option value="ModernTemplate">Modern</option>
                  <option value="ElegantCenteredTemplate">Elegant</option>
                  <option value="RedlineTemplate">Redline</option>
                </select>
              </div>
              <button
                onClick={handleExportDocx}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400"
              >
                Export as DOCX
              </button>
            </div>
            <div className="mt-4 border rounded-lg overflow-hidden">
              <SelectedTemplateComponent proposal={{...useProposalStore.getState()}} />
            </div>
          </div>
        )}

        {/* --- Full Editing Control Remains --- */}
        {proposalId && (
          <div className="mt-10 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Sections</h2>

            <SectionList 
              proposalId={proposalId} 
              openAiDialog={openAiDialog} 
              openImagePicker={openImagePicker} 
              openChartWizardForSection={openChartWizardForSection}
              handleRemoveTechLogo={handleRemoveTechLogo}
              handleAddSectionAtIndex={handleAddSectionAtIndex}
            />
          </div>
        )}

        {/* Modals for section-specific edits remain for user control */}
        <AIDialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} onApply={handleAiEnhance} />
        <ImagePickerModal open={imagePickerOpen} onClose={() => setImagePickerOpen(false)} onSelectImage={handleSelectImage} />
        <ChartWizardModal
          open={isChartWizardOpen}
          onClose={() => setChartWizardOpen(false)}
          onGenerate={handleGenerateChart}
          onFix={handleFixChart}
          loading={loading}
          suggestedChartType={undefined /* field not present in Section; placeholder */}
          currentMermaidCode={sections.find(s => s.id === selectedSectionForChart)?.mermaid_chart || undefined}
        />
      </div>
    </div>
  );
}