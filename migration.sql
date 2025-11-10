ALTER TABLE visa_tasks CHANGE COLUMN phase stage INT NOT NULL;

DROP INDEX unique_task ON visa_tasks;
CREATE UNIQUE INDEX unique_task ON visa_tasks (school_id, stage, task_index);

-- List triggers on your current database
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING, ACTION_STATEMENT
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
  AND (EVENT_OBJECT_TABLE = 'visa_tasks' OR EVENT_OBJECT_TABLE = 'visa_status');

-- Quickly search for any trigger bodies that mention 'phase'
SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE, ACTION_STATEMENT
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = DATABASE()
  AND ACTION_STATEMENT LIKE '%phase%';