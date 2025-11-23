-- Script pour ajouter des due_date aux corrective_actions existantes
-- Certaines dates sont dépassées pour tester l'alerte visuelle

-- Mettre à jour les corrective_actions avec des dates variées
UPDATE corrective_actions
SET due_date = CASE 
    -- Dates dépassées (en rouge avec alerte) - 40%
    WHEN random() < 0.2 THEN CURRENT_DATE - INTERVAL '5 days'
    WHEN random() < 0.4 THEN CURRENT_DATE - INTERVAL '2 days'
    
    -- Dates proches (aujourd'hui ou demain) - 40%
    WHEN random() < 0.6 THEN CURRENT_DATE
    WHEN random() < 0.8 THEN CURRENT_DATE + INTERVAL '1 day'
    
    -- Dates futures - 20%
    ELSE CURRENT_DATE + INTERVAL '7 days'
END
WHERE due_date IS NULL;

-- Afficher un résumé des mises à jour
SELECT 
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE) as overdue_count,
    COUNT(*) FILTER (WHERE due_date = CURRENT_DATE) as due_today_count,
    COUNT(*) FILTER (WHERE due_date > CURRENT_DATE) as future_count,
    COUNT(*) as total_updated
FROM corrective_actions
WHERE due_date IS NOT NULL;
