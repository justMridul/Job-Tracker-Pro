import React from 'react';

const About = () => (
  <main style={{ padding: '2rem', maxWidth: '800px', margin: 'auto', lineHeight: '1.6' }}>
    <h1>About Job Internship Tracker</h1>
    
    <p>
      Keep your job search organized and efficient with our comprehensive application tracking system. 
      Here's what you can do:
    </p>

    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>📝 Track Applications</h3>
      <ul style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>
        <li>Add job applications with company details, positions, and application dates</li>
        <li>Monitor application status through different stages (Applied, Interview, Offer, Accepted, Rejected)</li>
        <li>View all your applications in an organized dashboard</li>
      </ul>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🔍 Stay Organized</h3>
      <ul style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>
        <li>Search and filter applications by company, position, location, or status</li>
        <li>Sort applications by date, company, or status for quick access</li>
        <li>Visual Kanban board to see your application pipeline at a glance</li>
      </ul>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>✏️ Manage Your Data</h3>
      <ul style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>
        <li>Edit application details anytime as your job search progresses</li>
        <li>Delete applications you no longer need to track</li>
        <li>Update application status as you move through the hiring process</li>
      </ul>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>📊 Track Your Progress</h3>
      <ul style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>
        <li>View statistics showing total applications, interviews, offers, and more</li>
        <li>Monitor your success rate across different application stages</li>
        <li>Get insights into your job search performance</li>
      </ul>
    </div>

    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>🎯 Professional Interface</h3>
      <ul style={{ marginLeft: '1rem', marginBottom: '1.5rem' }}>
        <li>Clean, modern design that's easy to navigate</li>
        <li>Dark/light theme options for comfortable viewing</li>
        <li>Mobile-responsive design for tracking on any device</li>
      </ul>
    </div>

    <p style={{ 
      fontSize: '1.1rem', 
      fontWeight: '600', 
      color: '#667eea', 
      textAlign: 'center',
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      Start organizing your career journey today and never lose track of an opportunity again!
    </p>
  </main>
);

export default About;
