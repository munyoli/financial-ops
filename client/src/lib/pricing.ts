import { DirectCosts, IndirectCosts, BusinessCosts, PricingSummary } from './types';

export const calculateGarmentPricing = (
    direct_costs: Partial<DirectCosts>,
    indirect_costs: Partial<IndirectCosts>,
    business_costs: Partial<BusinessCosts>,
    markup: { wholesale: number; retail: number },
    advanced: { complexityMultiplier: number; taxRate: number } = { complexityMultiplier: 1, taxRate: 0 }
) => {
    // 1. Direct Costs
    const materials = direct_costs.materials || {
        main_fabric: 0, lining: 0, interfacing: 0, zip: 0, buttons_hooks: 0, thread: 0, trims: 0, labels: 0, subtotal_materials: 0,
    };

    const subtotal_materials =
        (materials.main_fabric || 0) + (materials.lining || 0) + (materials.interfacing || 0) +
        (materials.zip || 0) + (materials.buttons_hooks || 0) + (materials.thread || 0) +
        (materials.trims || 0) + (materials.labels || 0);

    const labour = direct_costs.labour || {
        pattern_making: 0, cutting: 0, sewing: 0, handwork: 0, finishing: 0, subtotal_labour: 0,
    };

    const subtotal_labour =
        (labour.pattern_making || 0) + (labour.cutting || 0) + (labour.sewing || 0) +
        (labour.handwork || 0) + (labour.finishing || 0);

    const packaging = direct_costs.packaging || {
        garment_bag: 0, tags: 0, hanger: 0, subtotal_packaging: 0,
    };

    const subtotal_packaging =
        (packaging.garment_bag || 0) + (packaging.tags || 0) + (packaging.hanger || 0);

    const wastage_percentage = direct_costs.wastage?.wastage_allowance_percentage || 0;
    const subtotal_pre_wastage = subtotal_materials + subtotal_labour + subtotal_packaging;
    const subtotal_wastage = subtotal_pre_wastage * (wastage_percentage / 100);

    const total_direct_costs = subtotal_pre_wastage + subtotal_wastage;

    const final_direct_costs: DirectCosts = {
        materials: { ...materials, subtotal_materials },
        labour: { ...labour, subtotal_labour },
        packaging: { ...packaging, subtotal_packaging },
        wastage: { wastage_allowance_percentage: wastage_percentage, subtotal_wastage },
        total_direct_costs,
    };

    // 2. Indirect Costs
    const indirect = indirect_costs || {
        rent_portion: 0, electricity_portion: 0, internet_portion: 0, phone_portion: 0,
        machine_maintenance: 0, staff_salaries_portion: 0, insurance_portion: 0,
        equipment_depreciation: 0, transport_for_sourcing: 0, total_indirect_costs: 0,
    };

    const total_indirect_costs =
        (indirect.rent_portion || 0) + (indirect.electricity_portion || 0) + (indirect.internet_portion || 0) +
        (indirect.phone_portion || 0) + (indirect.machine_maintenance || 0) + (indirect.staff_salaries_portion || 0) +
        (indirect.insurance_portion || 0) + (indirect.equipment_depreciation || 0) + (indirect.transport_for_sourcing || 0);

    const final_indirect_costs: IndirectCosts = {
        ...indirect as IndirectCosts,
        total_indirect_costs,
    };

    // 3. Business Costs
    const business = business_costs || {
        designer_fee: 0, marketing_portion: 0, software_subscriptions: 0,
        website_social_tools: 0, logistics_to_stockist: 0, contingency_percentage: 0, total_business_costs: 0,
    };

    const subtotal_business_base =
        (business.designer_fee || 0) + (business.marketing_portion || 0) + (business.software_subscriptions || 0) +
        (business.website_social_tools || 0) + (business.logistics_to_stockist || 0);

    const contingency_percentage = business.contingency_percentage || 0;
    const contingency_amount = (total_direct_costs + total_indirect_costs + subtotal_business_base) * (contingency_percentage / 100);
    const total_business_costs = subtotal_business_base + contingency_amount;

    const final_business_costs: BusinessCosts = {
        ...business as BusinessCosts,
        total_business_costs,
    };

    // 4. Summary & Pricing
    const base_total_cost = total_direct_costs + total_indirect_costs + total_business_costs;
    
    // Apply Complexity Multiplier to the entire cost base (Expert approach)
    // This accounts for extra hours and risk associated with complex designs
    const total_cost_price = base_total_cost * (advanced.complexityMultiplier || 1);
    
    const wholesale_price = total_cost_price * markup.wholesale;
    const recommended_retail_price = wholesale_price * markup.retail;

    // Expert Analysis: Tax & Profit
    const tax_amount = recommended_retail_price * (advanced.taxRate / 100);
    const net_revenue = recommended_retail_price - tax_amount;
    const net_profit = net_revenue - total_cost_price;
    const net_profit_margin_percentage = (net_profit / recommended_retail_price) * 100;

    const final_pricing_summary: PricingSummary = {
        total_cost_price,
        complexity_multiplier: advanced.complexityMultiplier,
        wholesale_markup: markup.wholesale,
        wholesale_price,
        retail_markup: markup.retail,
        recommended_retail_price,
        tax_amount,
        net_profit,
        net_profit_margin_percentage,
    };

    return {
        direct_costs: final_direct_costs,
        indirect_costs: final_indirect_costs,
        business_costs: final_business_costs,
        pricing_summary: final_pricing_summary,
    };
};
