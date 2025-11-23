-- Script pour assigner toutes les corrective_actions à BENELKARI Yassine

-- Mettre à jour toutes les corrective_actions non assignées
UPDATE corrective_actions
SET assigned_to = (
    SELECT id 
    FROM profiles 
    WHERE full_name = 'BENELKARI Yassine' 
    LIMIT 1
)
WHERE assigned_to IS NULL;

-- Afficher un résumé
SELECT 
    COUNT(*) as total_assigned,
    (SELECT full_name FROM profiles WHERE id = corrective_actions.assigned_to LIMIT 1) as assigned_to_name
FROM corrective_actions
WHERE assigned_to IS NOT NULL
GROUP BY assigned_to;
