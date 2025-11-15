-- SQL Script to Import Existing Members from src/data/members.js
-- Run this in Supabase SQL Editor to import all your existing members

-- Clear existing members first (optional - remove if you want to keep existing data)
-- DELETE FROM members;

-- Insert all existing members
INSERT INTO members (
  name, email, role, nationality, flag_code,
  description, full_description, membership_date,
  is_active, active_till, certificates, phone,
  location, website, linkedin, image
) VALUES
  (
    'Dr. Ahmed Hassan',
    'ahmed.hassan@eacsl.net',
    'Board Member',
    'Egyptian',
    'eg',
    'Experienced surgeon specializing in advanced cardiac procedures.',
    'Dr. Ahmed Hassan is an experienced cardiothoracic surgeon with over 15 years of expertise in advanced cardiac procedures. He specializes in minimally invasive techniques and has performed over 500 successful surgeries. His dedication to patient care and innovative surgical approaches has made him a respected figure in the medical community.',
    'January 2020',
    true,
    '2025',
    '["Board Certified Cardiothoracic Surgeon", "Advanced Cardiac Life Support (ACLS)", "Fellow of the American College of Surgeons", "European Board of Thoracic Surgery"]'::jsonb,
    '+20 123 456 7890',
    'Cairo, Egypt',
    'www.drahmedhassan.com',
    'linkedin.com/in/ahmedhassan',
    'https://images.unsplash.com/photo-1637059824899-a441006a6875?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Sarah Mitchell',
    'sarah.mitchell@eacsl.net',
    'Vice President',
    'American',
    'us',
    'Leading expert in pediatric cardiology with focus on congenital heart defects.',
    'Dr. Sarah Mitchell is a renowned pediatric cardiologist with 18 years of experience treating congenital heart defects in children. She has pioneered several innovative non-invasive diagnostic techniques and has published over 40 research papers in prestigious medical journals. Her compassionate approach and expertise have helped thousands of families.',
    'March 2018',
    true,
    '2025',
    '["Board Certified Pediatric Cardiologist", "Pediatric Advanced Life Support (PALS)", "Fellow of the American Academy of Pediatrics", "European Society of Cardiology Member"]'::jsonb,
    '+1 555 123 4567',
    'Boston, USA',
    'www.drsarahmitchell.com',
    'linkedin.com/in/sarahmitchell',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Yuki Tanaka',
    'yuki.tanaka@eacsl.net',
    'Research Director',
    'Japanese',
    'jp',
    'Pioneering researcher in cardiovascular regenerative medicine and stem cell therapy.',
    'Dr. Yuki Tanaka is a leading researcher in cardiovascular regenerative medicine with groundbreaking work in stem cell therapy for heart disease. With a PhD from Tokyo University and post-doctoral research at Stanford, Dr. Tanaka has contributed significantly to advancing treatments for heart failure through innovative cellular therapies.',
    'September 2019',
    true,
    '2025',
    '["PhD in Cardiovascular Medicine", "Board Certified in Internal Medicine", "International Society for Stem Cell Research Fellow", "Japanese Circulation Society Senior Member"]'::jsonb,
    '+81 90 1234 5678',
    'Tokyo, Japan',
    'www.dryukitanaka.com',
    'linkedin.com/in/yukitanaka',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Maria Santos',
    'maria.santos@eacsl.net',
    'Secretary General',
    'Brazilian',
    'br',
    'Expert in interventional cardiology with specialization in complex coronary procedures.',
    'Dr. Maria Santos is an accomplished interventional cardiologist with 20 years of expertise in complex coronary interventions. She has trained numerous fellows and residents in advanced catheterization techniques and is known for her exceptional skills in high-risk PCI procedures. Her work has significantly improved patient outcomes in acute coronary syndromes.',
    'June 2017',
    true,
    '2025',
    '["Board Certified Interventional Cardiologist", "Advanced Cardiovascular Life Support (ACLS)", "Fellow of the Society for Cardiovascular Angiography", "Latin American Society of Interventional Cardiology Member"]'::jsonb,
    '+55 11 98765 4321',
    'São Paulo, Brazil',
    'www.drmariasantos.com',
    'linkedin.com/in/mariasantos',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Mohamed Al-Rashid',
    'mohamed.alrashid@eacsl.net',
    'Board Member',
    'Saudi',
    'sa',
    'Specialist in cardiac electrophysiology and arrhythmia management.',
    'Dr. Mohamed Al-Rashid is a distinguished cardiac electrophysiologist with extensive experience in treating complex arrhythmias. He has performed over 1000 successful ablation procedures and is recognized for his expertise in implantable cardiac devices. His research contributions have advanced the field of cardiac rhythm management in the Middle East.',
    'April 2019',
    true,
    '2025',
    '["Board Certified Cardiac Electrophysiologist", "Certified Cardiac Device Specialist", "Heart Rhythm Society Fellow", "Saudi Heart Association Member"]'::jsonb,
    '+966 50 123 4567',
    'Riyadh, Saudi Arabia',
    'www.drmohamedalrashid.com',
    'linkedin.com/in/mohamedalrashid',
    'https://images.unsplash.com/photo-1582750433449-5ed4d9c0e4e4?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Fatima Al-Zahra',
    'fatima.alzahra@eacsl.net',
    'Treasurer',
    'Emirati',
    'ae',
    'Expert in preventive cardiology and cardiovascular risk management.',
    'Dr. Fatima Al-Zahra is a leading preventive cardiologist with a focus on cardiovascular risk assessment and management. She has developed innovative screening programs that have significantly reduced cardiovascular events in high-risk populations. Her work in public health cardiology has been recognized internationally.',
    'August 2020',
    true,
    '2025',
    '["Board Certified Preventive Cardiologist", "Certified Clinical Lipidologist", "American College of Cardiology Fellow", "Emirates Cardiac Society Member"]'::jsonb,
    '+971 50 123 4567',
    'Dubai, UAE',
    'www.drfatimaalzahra.com',
    'linkedin.com/in/fatimaalzahra',
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Khalid Al-Mansouri',
    'khalid.almansouri@eacsl.net',
    'Member',
    'Kuwaiti',
    'kw',
    'Specialist in heart failure and cardiac transplantation.',
    'Dr. Khalid Al-Mansouri is a renowned heart failure specialist with expertise in advanced heart failure management and cardiac transplantation. He has been instrumental in establishing the heart transplant program in Kuwait and has successfully managed over 200 heart failure patients. His research focuses on improving outcomes in advanced heart failure.',
    'November 2021',
    true,
    '2025',
    '["Board Certified Heart Failure Specialist", "Certified in Cardiac Transplantation", "International Society for Heart and Lung Transplantation Member", "Kuwait Heart Association Member"]'::jsonb,
    '+965 50 123 4567',
    'Kuwait City, Kuwait',
    'www.drkhalidalmansouri.com',
    'linkedin.com/in/khalidalmansouri',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  ),
  (
    'Dr. Layla Ibrahim',
    'layla.ibrahim@eacsl.net',
    'Member',
    'Jordanian',
    'jo',
    'Expert in cardiac imaging and non-invasive diagnostics.',
    'Dr. Layla Ibrahim is a leading cardiac imaging specialist with expertise in echocardiography, cardiac MRI, and CT angiography. She has trained numerous cardiologists in advanced imaging techniques and has contributed to developing imaging protocols that improve diagnostic accuracy. Her work has been published in major cardiology journals.',
    'February 2022',
    true,
    '2025',
    '["Board Certified in Cardiac Imaging", "Certified in Echocardiography", "Society of Cardiovascular Computed Tomography Member", "Jordanian Cardiology Society Member"]'::jsonb,
    '+962 79 123 4567',
    'Amman, Jordan',
    'www.drlaylaibrahim.com',
    'linkedin.com/in/laylaibrahim',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
  );

-- Verify the import
SELECT COUNT(*) as total_members, 
       COUNT(*) FILTER (WHERE is_active = true) as active_members
FROM members;

