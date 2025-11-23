-- Script pour mettre à jour reported_by pour tous les incidents vers 'Admin Project'

UPDATE incidents
SET reported_by = (
    SELECT id 
    FROM profiles 
    WHERE full_name = 'Admin Project' 
    LIMIT 1
);

-- Vérification
SELECT 
    count(*) as total_updated,
    (SELECT full_name FROM profiles WHERE id = incidents.reported_by LIMIT 1) as reported_by_name
FROM incidents
GROUP BY reported_by;
