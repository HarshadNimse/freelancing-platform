import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Proposal from '../models/Proposal.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Clear database and import
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Proposal.deleteMany();

    console.log('Data cleared...');

    // Create clients
    const client1 = await User.create({
      name: 'John Client',
      email: 'john@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'client',
    });

    const client2 = await User.create({
      name: 'Jane Client',
      email: 'jane@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'client',
    });

    console.log('Clients created...');

    // Create freelancers
    const freelancer1 = await User.create({
      name: 'Bob Freelancer',
      email: 'bob@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'freelancer',
      skills: ['JavaScript', 'React', 'Node.js'],
      bio: 'Experienced full-stack developer with 5 years of experience',
    });

    const freelancer2 = await User.create({
      name: 'Alice Freelancer',
      email: 'alice@example.com',
      password: await bcrypt.hash('123456', 10),
      role: 'freelancer',
      skills: ['Python', 'Django', 'Machine Learning'],
      bio: 'AI/ML specialist with strong backend skills',
    });

    console.log('Freelancers created...');

    // Create projects
    const project1 = await Project.create({
      title: 'E-commerce Website Development',
      description: 'Need a full-stack developer to create an e-commerce platform with product management, cart, and checkout functionality.',
      budget: 3000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      status: 'Approved',
      client: client1._id,
    });

    const project2 = await Project.create({
      title: 'Mobile App UI Design',
      description: 'Looking for a UI/UX designer to create a modern and intuitive interface for a fitness tracking app.',
      budget: 1500,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      skills: ['UI/UX', 'Figma', 'Mobile Design'],
      status: 'Pending',
      client: client1._id,
    });

    const project3 = await Project.create({
      title: 'Machine Learning Algorithm',
      description: 'Need help implementing a recommendation system based on user behavior data.',
      budget: 2500,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      skills: ['Python', 'Machine Learning', 'Data Science'],
      status: 'Approved',
      client: client2._id,
    });

    console.log('Projects created...');

    // Create proposals
    await Proposal.create({
      project: project1._id,
      freelancer: freelancer1._id,
      message: 'I have extensive experience building e-commerce websites with the MERN stack. I can deliver this project within your timeframe.',
      expectedBudget: 2800,
      status: 'Pending',
    });

    await Proposal.create({
      project: project3._id,
      freelancer: freelancer2._id,
      message: 'As an ML specialist, I can build a recommendation system that will significantly improve user engagement on your platform.',
      expectedBudget: 2400,
      status: 'Pending',
    });

    await Proposal.create({
      project: project1._id,
      freelancer: freelancer2._id,
      message: 'While my specialty is in ML, I have built several e-commerce sites and can handle this project efficiently.',
      expectedBudget: 3200,
      status: 'Pending',
    });

    console.log('Proposals created...');
    console.log('Data Import Success!');

    // Log credentials for testing
    console.log('\nUse these credentials to test the application:');
    console.log('---------------------------------------------');
    console.log('Client: john@example.com / 123456');
    console.log('Client: jane@example.com / 123456');
    console.log('Freelancer: bob@example.com / 123456');
    console.log('Freelancer: alice@example.com / 123456');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();