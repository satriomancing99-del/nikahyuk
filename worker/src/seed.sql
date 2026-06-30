-- Seed data for local testing
-- 1. Insert Profile
INSERT INTO profiles (id, name, email, phone, role)
VALUES ('user_dummy_1', 'Budi Handoko', 'budi@example.com', '081234567890', 'customer')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Invitation
INSERT INTO invitations (id, user_id, slug, groom_name, bride_name, groom_parent, bride_parent, quote, status)
VALUES (
  'invitation_dummy_1', 
  'user_dummy_1', 
  'budi-ani', 
  'Budi Handoko', 
  'Ani Lestari', 
  'Bpk. Handoko & Ibu Handoko', 
  'Bpk. Lestari & Ibu Lestari', 
  'Cinta bukanlah mencari pasangan yang sempurna, tapi belajar melihat pasangan yang tidak sempurna dengan cara yang sempurna.',
  'published'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Guests
INSERT INTO guests (id, invitation_id, name, phone, guest_code, sent_status, rsvp_status)
VALUES 
('guest_dummy_1', 'invitation_dummy_1', 'Bapak Ahmad', '082234567890', 'BUDIANI-AHMAD', 'sent', 'not_confirmed'),
('guest_dummy_2', 'invitation_dummy_1', 'Ibu Siti', '083234567890', 'BUDIANI-SITI', 'sent', 'attending')
ON CONFLICT (id) DO NOTHING;
