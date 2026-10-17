import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaStethoscope } from 'react-icons/fa';

const Healthcare = () => (
  <CategoryTemplate
    title="Healthcare, Medical & Biotech"
    categoryName="Healthcare"
    description="Clinical specialists, healthcare operations, biomedical technology, patient care, and pharmaceutical research."
    icon={<FaStethoscope />}
  />
);

export default Healthcare;
