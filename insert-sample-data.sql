-- Insert sample data for SafetySync
-- This will create 30+ incidents with variety across categories, severities, locations, and dates
-- Run this in Supabase SQL Editor

-- Clear existing sample data (optional)
-- DELETE FROM incidents WHERE description LIKE '%Sample%' OR description LIKE '%Test%';

-- Insert incidents from the last 6 months with variety
INSERT INTO incidents (category, severity, location, department, description, immediate_action, status, created_at) VALUES

-- Month 1 (5 months ago) - 8 incidents
('safety', 'critical', 'Production Floor A', 'Manufacturing', 'Worker slipped on wet floor near assembly line 3. Minor injury sustained.', 'Area cordoned off, wet floor signs placed, worker sent to medical.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '2 days'),
('quality', 'high', 'Quality Control Lab', 'QC', 'Batch #4521 failed tensile strength test. 15% below specification.', 'Batch quarantined, supplier notified, root cause analysis initiated.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '5 days'),
('environmental', 'medium', 'Warehouse B', 'Logistics', 'Small chemical spill (approx 2L) of cleaning solution in storage area.', 'Spill contained with absorbent pads, area ventilated, waste disposed properly.', 'closed', NOW() - INTERVAL '5 months' - INTERVAL '8 days'),
('equipment', 'high', 'Assembly Line 2', 'Production', 'Hydraulic press showing abnormal pressure readings. Risk of failure.', 'Machine shut down, maintenance team notified, backup equipment activated.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '10 days'),
('safety', 'low', 'Break Room', 'Facilities', 'Fire extinguisher found with expired inspection tag.', 'Extinguisher replaced immediately, inspection schedule reviewed.', 'closed', NOW() - INTERVAL '5 months' - INTERVAL '12 days'),
('quality', 'medium', 'Packaging Line', 'Production', 'Incorrect labels applied to 50 units of Product X.', 'Production halted, affected units quarantined, labels corrected.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '15 days'),
('safety', 'high', 'Loading Dock', 'Logistics', 'Forklift collision with storage rack. No injuries, structural damage to rack.', 'Area secured, damaged rack marked unsafe, forklift operator retrained.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '18 days'),
('equipment', 'critical', 'Boiler Room', 'Maintenance', 'Boiler pressure gauge malfunction detected during routine check.', 'Boiler shut down immediately, emergency maintenance called, backup heating activated.', 'resolved', NOW() - INTERVAL '5 months' - INTERVAL '20 days'),

-- Month 2 (4 months ago) - 12 incidents
('safety', 'medium', 'Production Floor B', 'Manufacturing', 'Employee reported repetitive strain injury from workstation setup.', 'Ergonomic assessment scheduled, temporary workstation adjustment made.', 'in-progress', NOW() - INTERVAL '4 months' - INTERVAL '1 day'),
('environmental', 'high', 'Paint Shop', 'Production', 'VOC emissions exceeded permitted levels during spray painting operation.', 'Operation suspended, ventilation system inspected, filters replaced.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '3 days'),
('quality', 'critical', 'Final Inspection', 'QC', 'Critical dimension out of tolerance on 100+ units discovered.', 'Production stopped, all units quarantined, measurement equipment calibrated.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '5 days'),
('equipment', 'medium', 'CNC Machine Shop', 'Production', 'CNC machine #7 showing intermittent error codes.', 'Machine tagged for maintenance, production rescheduled to other machines.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '7 days'),
('safety', 'low', 'Office Area', 'Administration', 'Loose electrical cable creating trip hazard in corridor.', 'Cable secured with cable management system, area inspected for similar hazards.', 'closed', NOW() - INTERVAL '4 months' - INTERVAL '9 days'),
('quality', 'high', 'Welding Station', 'Production', 'Weld quality inspection revealed porosity in 15 welds.', 'Affected welds marked for rework, welder retraining initiated.', 'in-progress', NOW() - INTERVAL '4 months' - INTERVAL '11 days'),
('environmental', 'low', 'Cafeteria', 'Facilities', 'Recycling bins not properly separated, contamination observed.', 'New signage installed, staff training on waste separation conducted.', 'closed', NOW() - INTERVAL '4 months' - INTERVAL '13 days'),
('safety', 'critical', 'Production Floor A', 'Manufacturing', 'Emergency stop button failed to activate during equipment test.', 'All production halted, safety systems inspected, faulty button replaced.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '15 days'),
('equipment', 'high', 'Compressor Room', 'Maintenance', 'Air compressor overheating, automatic shutdown triggered.', 'Cooling system cleaned, compressor serviced, temperature monitoring increased.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '17 days'),
('quality', 'medium', 'Assembly Line 1', 'Production', 'Missing components found in 5 assembled units.', 'Units disassembled, components added, assembly checklist revised.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '19 days'),
('safety', 'high', 'Warehouse C', 'Logistics', 'Pallet racking overloaded beyond safe working load.', 'Excess inventory removed, load limits posted, staff retrained on limits.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '22 days'),
('environmental', 'medium', 'Waste Storage', 'Facilities', 'Hazardous waste container found leaking in storage area.', 'Container transferred to secondary containment, cleanup performed, new container ordered.', 'resolved', NOW() - INTERVAL '4 months' - INTERVAL '25 days'),

-- Month 3 (3 months ago) - 6 incidents
('safety', 'medium', 'Parking Lot', 'Security', 'Poor lighting in employee parking area creating safety concern.', 'Additional lighting installed, security patrols increased.', 'resolved', NOW() - INTERVAL '3 months' - INTERVAL '2 days'),
('quality', 'low', 'Inspection Area', 'QC', 'Calibration sticker missing on measurement tool.', 'Tool recalibrated, sticker applied, calibration log updated.', 'closed', NOW() - INTERVAL '3 months' - INTERVAL '6 days'),
('equipment', 'critical', 'Power Distribution', 'Facilities', 'Electrical panel showing signs of overheating.', 'Panel de-energized, electrical contractor called, temporary power rerouted.', 'resolved', NOW() - INTERVAL '3 months' - INTERVAL '10 days'),
('safety', 'high', 'Chemical Storage', 'EHS', 'Incompatible chemicals stored in same cabinet.', 'Chemicals separated immediately, storage procedures reviewed, staff retrained.', 'resolved', NOW() - INTERVAL '3 months' - INTERVAL '14 days'),
('environmental', 'high', 'Wastewater Treatment', 'Facilities', 'pH levels in wastewater discharge outside permitted range.', 'Discharge stopped, treatment process adjusted, samples sent for testing.', 'in-progress', NOW() - INTERVAL '3 months' - INTERVAL '18 days'),
('quality', 'medium', 'Raw Materials', 'Receiving', 'Incoming material certificate of conformance missing key data.', 'Material quarantined, supplier contacted for complete documentation.', 'in-progress', NOW() - INTERVAL '3 months' - INTERVAL '22 days'),

-- Month 4 (2 months ago) - 5 incidents
('safety', 'low', 'Stairwell', 'Facilities', 'Handrail loose on main stairwell.', 'Handrail tightened and reinforced, all stairwells inspected.', 'closed', NOW() - INTERVAL '2 months' - INTERVAL '3 days'),
('equipment', 'medium', 'HVAC System', 'Maintenance', 'Air handling unit filter pressure differential high.', 'Filters replaced, system performance verified, maintenance schedule updated.', 'resolved', NOW() - INTERVAL '2 months' - INTERVAL '8 days'),
('quality', 'high', 'Testing Lab', 'QC', 'Test equipment showing drift beyond acceptable limits.', 'Equipment recalibrated, recent test results reviewed for validity.', 'resolved', NOW() - INTERVAL '2 months' - INTERVAL '12 days'),
('safety', 'critical', 'Production Floor B', 'Manufacturing', 'Machine guard removed and not replaced after maintenance.', 'Production stopped, guard reinstalled, lockout/tagout procedures reviewed.', 'resolved', NOW() - INTERVAL '2 months' - INTERVAL '16 days'),
('environmental', 'low', 'Office Area', 'Administration', 'Excessive paper waste observed, recycling not utilized.', 'Recycling bins added, awareness campaign launched, digital alternatives promoted.', 'closed', NOW() - INTERVAL '2 months' - INTERVAL '20 days'),

-- Month 5 (1 month ago) - 4 incidents
('safety', 'medium', 'Assembly Line 3', 'Production', 'Inadequate lighting causing eye strain complaints.', 'Lighting assessment conducted, additional fixtures installed.', 'resolved', NOW() - INTERVAL '1 month' - INTERVAL '5 days'),
('quality', 'critical', 'Final Assembly', 'Production', 'Wrong part installed in 20 units before detection.', 'All units recalled from shipping, correct parts installed, visual aids added to workstation.', 'in-progress', NOW() - INTERVAL '1 month' - INTERVAL '10 days'),
('equipment', 'high', 'Conveyor System', 'Maintenance', 'Conveyor belt showing excessive wear and fraying.', 'Belt replaced during scheduled downtime, inspection frequency increased.', 'resolved', NOW() - INTERVAL '1 month' - INTERVAL '15 days'),
('environmental', 'medium', 'Loading Dock', 'Logistics', 'Diesel fuel spill from delivery truck (approx 5L).', 'Spill kit deployed, contaminated soil removed, delivery procedures reviewed.', 'resolved', NOW() - INTERVAL '1 month' - INTERVAL '20 days'),

-- Month 6 (Current month) - 7 incidents
('safety', 'high', 'Warehouse A', 'Logistics', 'Near-miss: forklift almost struck pedestrian in blind corner.', 'Mirrors installed at corner, pedestrian walkway marked, speed limit enforced.', 'open', NOW() - INTERVAL '5 days'),
('quality', 'medium', 'Paint Booth', 'Production', 'Paint finish showing orange peel defect on multiple units.', 'Spray parameters adjusted, affected units scheduled for rework.', 'open', NOW() - INTERVAL '8 days'),
('equipment', 'low', 'Tool Crib', 'Maintenance', 'Hand tool inventory showing multiple missing items.', 'Inventory recount performed, tool checkout system implemented.', 'open', NOW() - INTERVAL '12 days'),
('safety', 'critical', 'Electrical Room', 'Facilities', 'Unauthorized access to electrical room, door found propped open.', 'Access control system upgraded, security awareness training scheduled.', 'in-progress', NOW() - INTERVAL '15 days'),
('environmental', 'high', 'Roof Area', 'Facilities', 'Storm drain blocked causing water pooling and potential contamination.', 'Drain cleared, preventive maintenance schedule established.', 'in-progress', NOW() - INTERVAL '18 days'),
('quality', 'low', 'Shipping', 'Logistics', 'Packaging material damaged during handling.', 'Damaged material replaced, handling procedures reviewed with staff.', 'open', NOW() - INTERVAL '22 days'),
('safety', 'medium', 'Production Floor A', 'Manufacturing', 'Noise levels measured above 85dB in grinding area.', 'Hearing protection enforced, engineering controls being evaluated.', 'open', NOW() - INTERVAL '25 days');

-- Verify the data
SELECT 
    category,
    severity,
    status,
    COUNT(*) as count,
    DATE_TRUNC('month', created_at) as month
FROM incidents
GROUP BY category, severity, status, DATE_TRUNC('month', created_at)
ORDER BY month DESC, category, severity;
