'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProposalStore } from '@/store/proposalStore';
import { createProposal, generateProposalDraft, aiEnhanceSection, addImage, generateChartForSection, getProposal } from '@/lib/api';
import SectionList from './SectionList';
import AIDialog from '../ui/AIDialog';
import ImagePickerModal from '../ui/ImagePickerModal';
import VersionHistoryModal from '../ui/VersionHistoryModal';
import ChartWizardModal from '../ui/ChartWizardModal';
import ClassicTemplate from '@/templates/ClassicTemplate';
import ModernTemplate from '@/templates/ModernTemplate';
import ElegantCenteredTemplate from '@/templates/ElegantCenteredTemplate';
import Toast from '../ui/Toast';

function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

const templates = {
  ClassicTemplate,
  ModernTemplate,
  ElegantCenteredTemplate,
};

export default function ProposalEditorPage() {
  const router = useRouter();
  const { 
    clientName, rfpText, totalAmount, paymentType, numDeliverables, startDate, endDate, companyInfo, sections, 
    setField, setSections, addImageToSection, updateSectionContent, removeImageFromSection, updateSectionMermaidChart, 
    updateSection, setTechStack, addTechLogoToSection
  } = useProposalStore();

  const [proposalId, setProposalId] = useState<number | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [versionHistoryModalOpen, setVersionHistoryModalOpen] = useState(false);
  const [selectedSectionForVersionHistory, setSelectedSectionForVersionHistory] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [isChartWizardOpen, setChartWizardOpen] = useState(false);
  const [selectedSectionForChart, setSelectedSectionForChart] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('ClassicTemplate');
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

  const handleGenerateProposal = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const proposalData = { clientName, rfpText, totalAmount, paymentType, numDeliverables, startDate, endDate, companyName: companyInfo.name, companyLogoUrl: companyInfo.logoUrl, companyContact: companyInfo.contact };
      const newProposal = await createProposal(proposalData);
      const newProposalId = newProposal.id;
      setProposalId(newProposalId);

      const updatedProposal = await generateProposalDraft(newProposalId);
      setSections(updatedProposal.sections);
      setTechStack(updatedProposal.tech_stack);


      setToast({ message: 'Proposal generated successfully!', type: 'success' });

    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
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

  const handleAiEnhance = async (action: string, tone: string) => {
    if (!selectedSectionId || !proposalId) return;
    setLoading(true);
    try {
      const enhancedSection = await aiEnhanceSection(proposalId, selectedSectionId, action, tone);
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
        addImageToSection(selectedSectionId, item.data.url);
        try {
          await addImage(proposalId, selectedSectionId, item.data.url);
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
      }
    }
  };

  const handleGenerateChart = async (description: string, chartType: any) => {
    if (!selectedSectionForChart || !proposalId) return;
    setLoading(true);
    try {
      const result = await generateChartForSection(proposalId, selectedSectionForChart, description, chartType);
      updateSectionMermaidChart(selectedSectionForChart, result.chartCode);
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
      updateSectionMermaidChart(selectedSectionForChart, result.chartCode);
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

  const openVersionHistoryModal = (sectionId: number) => {
    setSelectedSectionForVersionHistory(sectionId);
    setVersionHistoryModalOpen(true);
  };

  const openChartWizardForSection = (sectionId: number) => {
    setSelectedSectionForChart(sectionId);
    setChartWizardOpen(true);
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
                  onChange={(e) => setField('paymentType', e.target.value)}
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
            onClick={handleGenerateProposal}
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : '✨ Generate Proposal'}
          </button>

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
                </select>
              </div>
                          </div>
            <div className="mt-4 border rounded-lg overflow-hidden">
              <SelectedTemplateComponent proposal={{...useProposalStore.getState()}} customCss={useProposalStore.getState().custom_css} />
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
              openVersionHistoryModal={openVersionHistoryModal} 
              openChartWizardForSection={openChartWizardForSection}
            />
          </div>
        )}

        {/* Modals for section-specific edits remain for user control */}
        <AIDialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} onApply={handleAiEnhance} />
        <ImagePickerModal open={imagePickerOpen} onClose={() => setImagePickerOpen(false)} onSelectImage={handleSelectImage} />
        <VersionHistoryModal
          open={versionHistoryModalOpen}
          onClose={() => setVersionHistoryModalOpen(false)}
          sectionId={selectedSectionForVersionHistory}
          onRevert={() => {}}
        />
        <ChartWizardModal
          open={isChartWizardOpen}
          onClose={() => setChartWizardOpen(false)}
          onGenerate={handleGenerateChart}
          onFix={handleFixChart}
          loading={loading}
          suggestedChartType={sections.find(s => s.id === selectedSectionForChart)?.suggested_chart_type}
          currentMermaidCode={sections.find(s => s.id === selectedSectionForChart)?.mermaid_chart}
        />
      </div>
    </div>
  );
}