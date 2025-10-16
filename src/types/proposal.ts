export interface DesignSuggestion {
  prompt: string;
  css: string;
}

export interface Section {
  id: number;
  title: string;
  contentHtml: string;
  order: number;
  image_placement: string | null;
  mermaid_chart: string | null;
  chartType?: string;
  layout: string | null;
  // Note: The backend sends `image_urls`, but the frontend components might use an `images` array of objects.
  // We will stick to the backend model for now.
  image_urls: string[]; 
}

export interface Proposal {
  id: number;
  clientName: string;
  rfpText: string;
  totalAmount: number;
  paymentType: string;
  numDeliverables: number;
  startDate: string;
  endDate: string;
  companyName: string;
  companyLogoUrl: string;
  companyContact: string;
  sections: Section[];
  custom_css: string | null;
}
