-- Script pour créer des corrective_actions pour tous les incidents
-- et les assigner à BENELKARI Yassine avec des due dates

-- Étape 1: Créer des corrective_actions pour les incidents qui n'en ont pas
INSERT INTO corrective_actions (incident_id, assigned_to, action_description, due_date, status)
SELECT 
    i.id as incident_id,
    (SELECT id FROM profiles WHERE full_name = 'BENELKARI Yassine' LIMIT 1) as assigned_to,
    'Action corrective à définir' as action_description,
    CASE 
        -- Dates dépassées (en rouge avec alerte) - 40%
        WHEN random() < 0.2 THEN CURRENT_DATE - INTERVAL '5 days'
        WHEN random() < 0.4 THEN CURRENT_DATE - INTERVAL '2 days'
        
        -- Dates proches (aujourd'hui ou demain) - 40%
        WHEN random() < 0.6 THEN CURRENT_DATE
        WHEN random() < 0.8 THEN CURRENT_DATE + INTERVAL '1 day'
        
        -- Dates futures - 20%
        ELSE CURRENT_DATE + INTERVAL '7 days'
    END as due_date,
    'pending' as status
FROM incidents i
WHERE NOT EXISTS (
    SELECT 1 FROM corrective_actions ca WHERE ca.incident_id = i.id
);

-- Étape 2: Mettre à jour les incidents existants pour passer leur status à 'in-progress'
UPDATE incidents
SET status = 'in-progress'
WHERE id IN (
    SELECT incident_id FROM corrective_actions
)
AND status = 'open';

-- Afficher un résumé
SELECT 
    'Total incidents' as metric,
    COUNT(*) as count
FROM incidents
UNION ALL
SELECT 
    'Incidents avec corrective action' as metric,
    COUNT(DISTINCT incident_id) as count
FROM corrective_actions
UNION ALL
SELECT 
    'Corrective actions assignées à BENELKARI Yassine' as metric,
    COUNT(*) as count
FROM corrective_actions ca
JOIN profiles p ON ca.assigned_to = p.id
WHERE p.full_name = 'BENELKARI Yassine'
UNION ALL
SELECT 
    'Dates dépassées (overdue)' as metric,
    COUNT(*) as count
FROM corrective_actions
WHERE due_date < CURRENT_DATE;
