'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

import { useProposalStore } from '@/store/proposalStore';

const getChartType = (mermaidCode: string): string => {
  if (!mermaidCode) return '';
  const code = mermaidCode.toLowerCase().trim();
  if (code.startsWith('graph') || code.startsWith('flowchart')) return 'Flowchart';
  if (code.startsWith('gantt')) return 'Gantt Chart';
  if (code.startsWith('pie')) return 'Pie Chart';
  if (code.startsWith('sequence')) return 'Sequence Diagram';
  if (code.startsWith('mindmap')) return 'Mind Map';
  if (code.startsWith('journey')) return 'User Journey';
  if (code.startsWith('c4')) return 'C4 Diagram';
  return 'Diagram';
};

interface MermaidChartProps {
  chart: string;
  onEdit?: () => void;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart, onEdit }) => {
  const [svg, setSvg] = useState('');
  const { chartTheme } = useProposalStore();

      useEffect(() => {
        const currentChartType = getChartType(chart);
  
        mermaid.initialize({
          startOnLoad: false, // We will render manually
          theme: chartTheme,
          securityLevel: 'loose',
          gantt: {
            fontSize: 16, // Larger font size for tasks and labels
            leftPadding: 75, // More padding on the left for task names
            // You can add more gantt specific configurations here
          },
          // Set width specifically for Gantt charts
          ...(currentChartType === 'Gantt Chart' && { width: 1000 }),
        });
    if (chart) {
      try {
        // Unique ID for each render to avoid conflicts
        const renderId = `mermaid-chart-${Math.random().toString(36).substring(7)}`;
        
        mermaid.render(renderId, chart)
          .then(({ svg }) => {
            setSvg(svg);
          })
                  .catch(error => {
                    console.error('Mermaid rendering error:', error);
                    setSvg(`<div class="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg">
                              <p class="font-bold">Error rendering diagram:</p>
                              <p>${error.message || 'Unknown error'}</p>
                              <pre class="mt-2 p-2 bg-gray-100 rounded-md text-sm"><code>${chart}</code></pre>
                            </div>`);
                  });      } catch (error) {
        console.error('Mermaid rendering error:', error);
        setSvg(`<p>Error rendering chart. Please check the diagram code for syntax errors.</p>`);
      }
    }
  }, [chart]);

  // Render a placeholder while SVG is being generated
  if (!svg) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="mermaid-chart-container w-full h-full">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
        >
          Edit with AI
        </button>
      )}
    </div>
  );
};

export default MermaidChart;
