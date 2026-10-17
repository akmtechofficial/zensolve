import React from 'react';
import CategoryTemplate from './CategoryTemplate';
import { FaTruck } from 'react-icons/fa';

const Logistics = () => (
  <CategoryTemplate
    title="Logistics & Supply Chain Operations"
    categoryName="Logistics"
    description="Supply chain dispatch, warehouse management, freight forwarding, inventory management, and procurement."
    icon={<FaTruck />}
  />
);

export default Logistics;
