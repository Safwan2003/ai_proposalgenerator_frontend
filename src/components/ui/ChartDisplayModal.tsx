'use client';

import React from 'react';
import Modal from './Modal'; // Assuming you have a generic Modal component
import MermaidChart from '../MermaidChart';

interface ChartDisplayModalProps {
  open: boolean;
  onClose: () => void;
  chartCode: string;
  chartType: string;
}

const ChartDisplayModal: React.FC<ChartDisplayModalProps> = ({
  open,
  onClose,
  chartCode,
  chartType,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={`View ${chartType}`}>
      <div className="w-full h-full overflow-auto p-4">
        {chartCode ? (
          <MermaidChart chart={chartCode} />
        ) : (
          <p>No chart data available.</p>
        )}
      </div>
    </Modal>
  );
};

export default ChartDisplayModal;
