-- Script pour assigner des utilisateurs aux corrective_actions
-- Distribue aléatoirement les incidents entre les utilisateurs existants

-- Mettre à jour les corrective_actions avec des assigned_to aléatoires
WITH random_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY random()) as rn
    FROM profiles
    WHERE role IN ('admin', 'manager', 'user')
),
actions_to_update AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY random()) as rn
    FROM corrective_actions
    WHERE assigned_to IS NULL
)
UPDATE corrective_actions
SET assigned_to = random_users.id
FROM actions_to_update
JOIN random_users ON (actions_to_update.rn - 1) % (SELECT COUNT(*) FROM random_users) + 1 = random_users.rn
WHERE corrective_actions.id = actions_to_update.id;

-- Afficher un résumé des assignations
SELECT 
    p.full_name,
    p.username,
    COUNT(ca.id) as assigned_count
FROM profiles p
LEFT JOIN corrective_actions ca ON ca.assigned_to = p.id
WHERE p.role IN ('admin', 'manager', 'user')
GROUP BY p.id, p.full_name, p.username
ORDER BY assigned_count DESC;
