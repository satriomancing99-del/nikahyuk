-- 018_seed_bgm_library.sql
-- Migration to seed the default/public BGM songs list in the database with local working assets.

INSERT INTO public.music_library (title, artist, url, is_private)
SELECT title, artist, url, is_private
FROM (VALUES
  -- Indonesian Pop / Romantic
  ('Janji Suci', 'Yovie & Nuno', '/music/romantic-wedding.mp3', false),
  ('Akad', 'Payung Teduh', '/music/romantic-wedding.mp3', false),
  ('Teman Hidup', 'Tulus', '/music/romantic-wedding.mp3', false),
  ('Kisah Romantis', 'Glenn Fredly', '/music/romantic-wedding.mp3', false),
  ('Menikahimu', 'Kahitna', '/music/romantic-wedding.mp3', false),
  ('Pilihanku', 'MALIQ & D’Essentials', '/music/romantic-wedding.mp3', false),
  ('Kesempurnaan Cinta', 'Rizky Febian', '/music/romantic-wedding.mp3', false),
  ('Akhirnya Aku Menemukanmu', 'NaFF', '/music/romantic-wedding.mp3', false),
  ('Anugerah Terindah yang Pernah Kumiliki', 'Sheila On 7', '/music/romantic-wedding.mp3', false),
  ('Aku dan Dirimu', 'Ari Lasso feat. BCL', '/music/romantic-wedding.mp3', false),
  ('Bukti', 'Virgoun', '/music/romantic-wedding.mp3', false),
  ('Cinta Luar Biasa', 'Andmesh', '/music/romantic-wedding.mp3', false),
  ('Bukan Cinta Biasa', 'Afgan', '/music/romantic-wedding.mp3', false),
  ('Could It Be', 'Raisa', '/music/romantic-wedding.mp3', false),

  -- International Pop / Romantic
  ('A Thousand Years', 'Christina Perri', '/music/romantic-wedding.mp3', false),
  ('Perfect', 'Ed Sheeran', '/music/romantic-wedding.mp3', false),
  ('Marry You', 'Bruno Mars', '/music/romantic-wedding.mp3', false),
  ('All of Me', 'John Legend', '/music/romantic-wedding.mp3', false),
  ('From This Moment On', 'Shania Twain', '/music/romantic-wedding.mp3', false),
  ('Endless Love', 'Lionel Richie & Diana Ross', '/music/romantic-wedding.mp3', false),
  ('I Finally Found Someone', 'Barbra Streisand & Bryan Adams', '/music/romantic-wedding.mp3', false),
  ('You Are the Reason', 'Calum Scott', '/music/romantic-wedding.mp3', false),
  ('Can’t Help Falling in Love', 'Elvis Presley', '/music/romantic-wedding.mp3', false),
  ('Sugar', 'Maroon 5', '/music/romantic-wedding.mp3', false),

  -- Islamic / Nasheed
  ('Barakallah', 'Maher Zain', '/music/islamic-nasheed.mp3', false),
  ('For the Rest of My Life', 'Maher Zain', '/music/islamic-nasheed.mp3', false),
  ('Sepanjang Hidup', 'Maher Zain', '/music/islamic-nasheed.mp3', false),
  ('Ya Nabi Salam Alayka', 'Maher Zain', '/music/islamic-nasheed.mp3', false),
  ('Assalamu Alayka', 'Maher Zain', '/music/islamic-nasheed.mp3', false),
  ('Deen Assalam', 'Sabyan', '/music/islamic-nasheed.mp3', false),
  ('Ya Maulana', 'Sabyan', '/music/islamic-nasheed.mp3', false),
  ('Aisyah Istri Rasulullah', 'Sabyan', '/music/islamic-nasheed.mp3', false),
  ('Allah Allah Aghisna', 'Sabyan', '/music/islamic-nasheed.mp3', false),
  ('Wedding Nasheed Instrumental', 'Instrumental', '/music/islamic-nasheed.mp3', false),

  -- Classical / Instrumental
  ('Canon in D', 'Johann Pachelbel', '/music/classical-canon.mp3', false),
  ('A Thousand Years Instrumental', 'Instrumental', '/music/romantic-wedding.mp3', false),
  ('Perfect Instrumental', 'Instrumental', '/music/romantic-wedding.mp3', false),
  ('River Flows in You', 'Yiruma', '/music/classical-canon.mp3', false),
  ('Kiss the Rain', 'Yiruma', '/music/classical-canon.mp3', false),
  ('Beautiful in White Instrumental', 'Instrumental', '/music/romantic-wedding.mp3', false),
  ('Wedding March', 'Felix Mendelssohn', '/music/classical-canon.mp3', false),
  ('Can’t Help Falling in Love Instrumental', 'Instrumental', '/music/romantic-wedding.mp3', false)
) AS t(title, artist, url, is_private)
WHERE NOT EXISTS (
  SELECT 1 FROM public.music_library WHERE music_library.title = t.title AND music_library.artist = t.artist
);
