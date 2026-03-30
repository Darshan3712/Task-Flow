/**
 * Migration script: Reassign orphaned tasks to the correct project.
 *
 * This script finds all tasks whose projectId does NOT match any existing
 * project and reassigns them to a project you specify (by name).
 *
 * Usage:  node migrate-tasks.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Task    = require('./models/Task');
const Project = require('./models/Project');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Get all current projects
  const projects = await Project.find();
  console.log('\n=== Current Projects ===');
  projects.forEach(p => console.log(`  ${p.name}  →  ${p._id}`));

  const validProjectIds = projects.map(p => p._id.toString());

  // 2. Get all tasks
  const allTasks = await Task.find();
  console.log(`\nTotal task documents in DB: ${allTasks.length}`);

  // 3. Find orphaned tasks (projectId doesn't match any current project)
  const orphaned = allTasks.filter(t => !validProjectIds.includes(t.projectId.toString()));
  console.log(`Orphaned task documents: ${orphaned.length}`);

  if (orphaned.length === 0) {
    console.log('\nNo orphaned tasks found. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  // Show orphaned tasks
  console.log('\n=== Orphaned Tasks ===');
  orphaned.forEach(t => {
    console.log(`  projectId: ${t.projectId}  |  date: ${t.date}  |  entries: ${t.entries.length}`);
    t.entries.forEach(e => console.log(`    → "${e.title}" (status: ${e.status})`));
  });

  // 4. Pick the first project as a default target — or you can change this
  //    We'll try to find "MWW" first, otherwise use the first project.
  const targetProject = projects.find(p => /mww/i.test(p.name)) || projects[0];
  console.log(`\nTarget project for reassignment: "${targetProject.name}" (${targetProject._id})`);

  // 5. Reassign each orphaned task
  for (const task of orphaned) {
    const newProjectId = targetProject._id;
    // Check if a task already exists for this project+date combo (avoid duplicate key)
    const existing = await Task.findOne({ projectId: newProjectId, date: task.date });
    if (existing) {
      // Merge entries into the existing document
      existing.entries.push(...task.entries);
      await existing.save();
      await Task.findByIdAndDelete(task._id);
      console.log(`  Merged ${task.entries.length} entries into existing doc for ${task.date}`);
    } else {
      // Just update the projectId
      task.projectId = newProjectId;
      await task.save();
      console.log(`  Reassigned task doc for ${task.date} → ${targetProject.name}`);
    }
  }

  console.log('\n✅ Migration complete!');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
