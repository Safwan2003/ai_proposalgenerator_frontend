export interface Section {
  id: number;
  title: string;
  contentHtml: string;
  image_urls: string[];
  order: number;
  image_placement: string | null;
  mermaid_chart: string | null;
  layout: string | null;
}