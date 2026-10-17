import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaChartLine } from 'react-icons/fa';

const Finance = () => (
  <CategoryTemplate
    title="Finance, Banking & Accounting"
    categoryName="Finance"
    description="Investment banking, corporate audit, wealth management, risk modeling, and financial planning positions."
    icon={<FaChartLine />}
  />
);

export default Finance;
