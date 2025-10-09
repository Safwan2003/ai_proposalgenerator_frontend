'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useProposalStore } from '@/store/proposalStore';
import { createProposal, generateProposalDraft, aiEnhanceSection, deleteSection, addNewSection, updateSectionApi, getProposal, applyDesign, exportProposal, addImage, generateChart, generateChartForSection } from '@/lib/api';
import SectionList from './SectionList';
import AIDialog from '../ui/AIDialog';
import ImagePickerModal from '../ui/ImagePickerModal';
import ExportModal from '../ui/ImagePickerModal';
import VersionHistoryModal from '../ui/VersionHistoryModal';
import GenerateContentModal from '../ui/GenerateContentModal';
import ManageSectionsModal from '../ui/ManageSectionsModal';
import ApplyDesignModal from '../ui/ApplyDesignModal'; // Import the new modal
import ChartWizardModal from '../ui/ChartWizardModal';


export default function ProposalEditorPage() {
  const router = useRouter(); // Initialize the router
  const {
    clientName,
    rfpText,
    totalAmount,
    paymentType,
    numDeliverables,
    startDate,
    endDate,
    companyInfo,
    sections,
    setField,
    setSections,
    addImageToSection,
    updateSectionContent,
    removeImageFromSection,
    updateSectionMermaidChart,
    chartTheme,
    setChartTheme,
  } = useProposalStore();

  const [selectedSectionForChart, setSelectedSectionForChart] = useState<number | null>(null);

  const [proposalId, setProposalId] = useState<number | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [versionHistoryModalOpen, setVersionHistoryModalOpen] = useState(false);
  const [selectedSectionForVersionHistory, setSelectedSectionForVersionHistory] = useState<number | null>(null);
  const [generateContentModalOpen, setGenerateContentModalOpen] = useState(false);
  const [selectedSectionForContentGeneration, setSelectedSectionForContentGeneration] = useState<number | null>(null);
  const [manageSectionsModalOpen, setManageSectionsModalOpen] = useState(false);
  const [applyDesignModalOpen, setApplyDesignModalOpen] = useState(false); // State for new modal
  const [chartWizardOpen, setChartWizardOpen] = useState(false);
  const [suggestedChart, setSuggestedChart] = useState<string | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!clientName) {
      newErrors.clientName = 'Client name cannot be empty.';
    }

    if (totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount must be a positive number.';
    }

    if (new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be before start date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateProposal = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      // 1. Create the proposal
      const proposalData = {
        clientName,
        rfpText,
        totalAmount,
        paymentType,
        numDeliverables,
        startDate,
        endDate,
        companyName: companyInfo.name,
        companyLogoUrl: companyInfo.logoUrl,
        companyContact: companyInfo.contact,
      };
      const newProposal = await createProposal(proposalData);
      const newProposalId = newProposal.id;
      setProposalId(newProposalId);

      // 2. Generate the proposal draft
      const updatedProposal = await generateProposalDraft(newProposalId);
      setSections(updatedProposal.sections);

      // 3. Open the ManageSectionsModal
      setManageSectionsModalOpen(true);

    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = async (description: string, chartType: 'flowchart' | 'gantt') => {
    if (!proposalId) return;
    setLoading(true);
    try {
      const updatedProposal = await generateChart(proposalId, description, chartType);
      setSections(updatedProposal.sections);
      setChartWizardOpen(false);
    } catch (error: any) {
      console.error('Error generating chart:', error.response ? error.response.data : error.message);
      setErrors({ ...errors, form: 'Error generating chart. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const openChartWizardForSection = (sectionId: number, suggestedChartType?: string) => {
    setSelectedSectionForChart(sectionId);
    if (suggestedChartType) {
      setSuggestedChart(suggestedChartType);
    }
    setChartWizardOpen(true);
  };

  const handleChartWizardGenerate = async (description: string, chartType: 'flowchart' | 'gantt') => {
    if (!proposalId) return;

    setLoading(true);
    try {
      if (selectedSectionForChart) {
        // Add chart to existing section
        const updatedSection = await generateChartForSection(proposalId, selectedSectionForChart, description, chartType);
        updateSectionMermaidChart(selectedSectionForChart, updatedSection.mermaid_chart || '');
      } else {
        // Create new chart section
        const updatedProposal = await generateChart(proposalId, description, chartType);
        setSections(updatedProposal.sections);
      }
      setChartWizardOpen(false);
      setSelectedSectionForChart(null);
    } catch (error: any) {
      console.error('Error in chart wizard:', error.response ? error.response.data : error.message);
      setErrors({ ...errors, form: 'Error in chart wizard. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSectionsSave = async (newSections) => {
    if (!proposalId) return;

    setLoading(true);
    try {
      const originalSections = sections;
      let updatedProposal;

      // Find deleted sections
      const deletedSections = originalSections.filter(os => !newSections.some(ns => ns.id === os.id));
      for (const section of deletedSections) {
        // Check if the section id is a temporary one from Date.now()
        if (section.id > 1000000) continue;
        await deleteSection(proposalId, section.id);
      }

      // Find new and updated sections
      let order = 1;
      for (const section of newSections) {
        const originalSection = originalSections.find(os => os.id === section.id);
        if (!originalSection) {
          // New section
          updatedProposal = await addNewSection(proposalId, { title: section.title, contentHtml: '', order: order });
        } else if (originalSection.title !== section.title) {
          // Updated section
          updatedProposal = await updateSectionApi(proposalId, section.id, { title: section.title });
        }
        order++;
      }

      if (updatedProposal) {
        setSections(updatedProposal.sections);
      }
      
      setManageSectionsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving sections:', error.response ? error.response.data : error.message);
      setErrors({ ...errors, form: 'Error saving sections. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAiEnhance = async (action: string, tone: string) => {
    if (!selectedSectionId || !proposalId) return;

    setLoading(true);
    try {
      const enhancedSection = await aiEnhanceSection(proposalId, selectedSectionId, action, tone);
      updateSectionContent(selectedSectionId, enhancedSection.contentHtml);
    } catch (error: any) {
      console.error('Error enhancing section:', error.response ? error.response.data : error.message);
      setErrors({ ...errors, form: 'Error enhancing section. Please try again.' });
    } finally {
      setLoading(false);
      setAiDialogOpen(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    if (selectedSectionId && proposalId) {
      // Optimistically update the UI
      addImageToSection(selectedSectionId, imageUrl);

      try {
        await addImage(proposalId, selectedSectionId, imageUrl);
      } catch (error) {
        console.error('Error adding image:', error);
        // Revert the UI change if the API call fails
        removeImageFromSection(selectedSectionId, imageUrl);
        alert('Error adding image. Please try again.');
      }
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

    const handleApplyDesign = async (css: string) => {
      if (!proposalId) return;
      setLoading(true);
      try {
        await applyDesign(proposalId, css);
        alert('Design applied successfully! Check the preview.');
      } catch (error: any) {
        console.error('Error applying design:', error.response ? error.response.data : error.message);
        setErrors({ ...errors, form: 'Error applying design. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Create New Proposal</h1>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Proposal Inputs */}
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
  
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={handleGenerateProposal}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : 'Generate Proposal'}
            </button>
            <button
              onClick={() => proposalId && router.push(`/proposal/${proposalId}/preview`)}
              disabled={!proposalId || loading}
              className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              Preview Proposal
            </button>
            <button
              onClick={() => setApplyDesignModalOpen(true)} // New button to open design modal
              disabled={!proposalId || loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              Apply AI Design
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              disabled={!proposalId || loading}
              className="bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              Export Proposal
            </button>
            <button
              onClick={() => setChartWizardOpen(true)}
              disabled={!proposalId || loading}
              className="bg-teal-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-teal-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              Add Chart
            </button>
            <select
              value={chartTheme}
              onChange={(e) => setChartTheme(e.target.value as 'default' | 'neutral' | 'dark' | 'forest')}
              className="bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-700 transition-colors shadow-md disabled:bg-gray-400"
            >
              <option value="default">Default Theme</option>
              <option value="neutral">Neutral Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="forest">Forest Theme</option>
            </select>
          </div>
          {errors.form && <p className="text-red-500 text-center mt-4">{errors.form}</p>}
  
          {proposalId && <SectionList proposalId={proposalId} openAiDialog={openAiDialog} openImagePicker={openImagePicker} openVersionHistoryModal={openVersionHistoryModal} openChartWizardForSection={openChartWizardForSection} />}
  
          <AIDialog open={aiDialogOpen} onClose={() => setAiDialogOpen(false)} onApply={handleAiEnhance} />
          <ImagePickerModal open={imagePickerOpen} onClose={() => setImagePickerOpen(false)} onSelectImage={handleSelectImage} />
          <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} proposalId={proposalId} />
          <VersionHistoryModal
            open={versionHistoryModalOpen}
            onClose={() => setVersionHistoryModalOpen(false)}
            sectionId={selectedSectionForVersionHistory}
            onRevert={() => { /* TODO: Refresh section content after revert */ }}
          />
          <ManageSectionsModal
            open={manageSectionsModalOpen}
            onClose={() => setManageSectionsModalOpen(false)}
            sections={sections}
            onSave={handleManageSectionsSave}
          />
          <ApplyDesignModal
            open={applyDesignModalOpen}
            onClose={() => setApplyDesignModalOpen(false)}
            onApply={handleApplyDesign}
            proposalId={proposalId}
          />
          <ChartWizardModal
            open={chartWizardOpen}
            onClose={() => {
              setChartWizardOpen(false);
              setSelectedSectionForChart(null);
            }}
            onGenerate={handleChartWizardGenerate}
            loading={loading}
            suggestedChartType={suggestedChart}
          />
        </div>
      </div>
    );
  }
